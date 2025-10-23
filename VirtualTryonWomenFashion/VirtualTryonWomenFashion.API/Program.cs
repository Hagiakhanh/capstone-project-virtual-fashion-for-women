using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Service.Extensions;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;
using VirtualTryonWomenFashion.Service.Utils;
using VirtualTryonWomenFashion.Service.Workers;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using VirtualTryonWomenFashion.Service.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 200 * 1024 * 1024; // 200 MB
});
// Add services to the container.
builder.Services.AddDbContext<VirtualTryonWomenFashionContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyDbContext"));
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
builder.Services.AddHttpClient<IColormindSerivce, ColormindService>();
builder.Services.AddHttpClient<IOrderService, OrderService>((serviceProvider, client) =>
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
        opt.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
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

builder.Services.AddControllers();
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
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
           builder => builder.WithOrigins("http://localhost:3000")
          .AllowAnyMethod()
          .AllowAnyHeader()
          .AllowCredentials()
          .WithExposedHeaders("X-Pagination")
          );
});
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    // Ch? áp d?ng logic này cho các request ??n Hub c?a b?n
    if (context.Request.Path.StartsWithSegments("/chathub"))
    {
        if (context.Request.Cookies.TryGetValue("token", out var token))
        {
            // Thêm token vào Header Authorization. Vi?c này cho phép JWT Middleware 
            // xác th?c k?t n?i SignalR ? b??c ti?p theo (app.UseAuthentication).
            context.Request.Headers.Add("Authorization", $"Bearer {token}");
        }
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowAll");

app.MapHub<TicketChatHub>("/chathub");

app.MapControllers();

app.Run();
