using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Service.Extensions;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.Hubs;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;
using VirtualTryonWomenFashion.Service.Utils;
using VirtualTryonWomenFashion.Service.Workers;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 200 * 1024 * 1024; // 200 MB
});
// Add services to the container.
builder.Services.AddDbContext<VirtualTryonWomenFashionContext>(options =>
{
    options.UseSqlServer(
            builder.Configuration.GetConnectionString("MyDbContext"),
            sqlOptions =>
            {
                sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
            }
        );
});

builder.Services.AddStackExchangeRedisCache(option =>
{
    option.Configuration = builder.Configuration.GetConnectionString("RedisCloud");
});
builder.Services.RegistDependencyInjection();
builder.Services.RegistAutoMapperService();

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
});
builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
builder.Services.Configure<GHNSettings>(builder.Configuration.GetSection("GHNSetttings"));
builder.Services.AddHttpClient<IGeminiService, GeminiService>();
builder.Services.AddHttpClient<IVectorDbService, PineconeService>();
builder.Services.AddHttpClient<IColorRecommendationSerivce, ColorRecommendationService>();
builder.Services.AddHttpClient<IOrderService, OrderService>((serviceProvider, client) =>
{
    var settings = serviceProvider.GetRequiredService<IOptions<GHNSettings>>().Value;
    client.BaseAddress = new Uri(settings.GHNBaseUrl);
    client.DefaultRequestHeaders.Add("Token", settings.Token);
    client.DefaultRequestHeaders.Add("ShopId", settings.ShopId.ToString());
});
builder.Services.AddHttpClient<IOrderRefundService, OrderRefundService>((serviceProvider, client) =>
{
    var settings = serviceProvider.GetRequiredService<IOptions<GHNSettings>>().Value;
    client.BaseAddress = new Uri(settings.GHNBaseUrl);
    client.DefaultRequestHeaders.Add("Token", settings.Token);
    client.DefaultRequestHeaders.Add("ShopId", settings.ShopId.ToString());
});
builder.Services.AddHttpClient<IFitRoomService, FitRoomService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(120);
});
builder.Services.AddSignalR();
builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    }).ConfigureApiBehaviorOptions(option =>
    {
        option.InvalidModelStateResponseFactory = actioncontext =>
        {
            var errors = actioncontext.ModelState
                .Where(e => e.Value.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );
            var errorResponse = new MessageModelWithData<object>
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Error: " + string.Join(", ", errors.SelectMany(e => e.Value)),
                Data = null
            };
            return new BadRequestObjectResult(errorResponse);
        };
    });
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Chính sách chống spam: 20 request / 1 giây / IP
    options.AddPolicy("StrictPerSecond", context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromSeconds(1),
                SegmentsPerWindow = 5,
                QueueLimit = 0
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.ContentType = "application/json";

        await context.HttpContext.Response.WriteAsync(
            "{\"message\":\"Bạn đang gửi request quá nhanh, vui lòng thử lại sau.\"}");
    };
});
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:ValidIssuer"],
        ValidAudience = builder.Configuration["JwtSettings:ValidAudience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]))
    };
});
//
// builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "VirtualTryonWomenFashionApi", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type=ReferenceType.SecurityScheme,
                                Id="Bearer"
                            }
                        },
                        new string[]{}
                    }
                });
});

builder.Services.AddHostedService<SaleCampaignWorkerService>();
builder.Services.AddHostedService<PaymentWorkerService>();
builder.Services.AddHostedService<GhnSyncStatusService>();
builder.Services.AddHostedService<RecommendationBackgroundService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
           builder => builder.WithOrigins("http://localhost:3000", "https://capstone-project-virtual-fashion-fo.vercel.app", "https://onlinewomanfashion.store")
          .AllowAnyMethod()
          .AllowAnyHeader()
          .AllowCredentials()
          .WithExposedHeaders("X-Pagination")
          );
});
var app = builder.Build();

app.UseMiddleware<JwtBlacklistMiddleware>();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    // Ch? �p d?ng logic n�y cho c�c request ??n Hub c?a b?n
    if (context.Request.Path.StartsWithSegments("/chathub"))
    {
        if (context.Request.Cookies.TryGetValue("token", out var token))
        {
            // Th�m token v�o Header Authorization. Vi?c n�y cho ph�p JWT Middleware 
            // x�c th?c k?t n?i SignalR ? b??c ti?p theo (app.UseAuthentication).
            context.Request.Headers.Add("Authorization", $"Bearer {token}");
        }
    }
    if (context.Request.Path.StartsWithSegments("/notificationhub"))
    {
        if (context.Request.Cookies.TryGetValue("token", out var token))
        {
            context.Request.Headers.Add("Authorization", $"Bearer {token}");
        }
    }
    await next();
});

app.UseRouting();
app.UseCors("AllowAll");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();


app.MapHub<TicketChatHub>("/chathub");
app.MapHub<NotificationHub>("/notificationhub");
app.MapControllers().RequireRateLimiting("StrictPerSecond"); ;

app.Run();
