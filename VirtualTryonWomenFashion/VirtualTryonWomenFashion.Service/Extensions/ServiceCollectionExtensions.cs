using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.Service.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection RegistDependencyInjection(this IServiceCollection services)
        {
            //Repositories
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped(typeof(IUnitOfWork), typeof(UnitOfWork));
            services.AddScoped<IAiconversationRepository, AiconversationRepository>();
            services.AddScoped<ICartRepository, CartRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICharacteristicRepository, CharacteristicRepository>();
            services.AddScoped<IColorRepository, ColorRepository>();
            services.AddScoped<IMessageRepository, MessageRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IOrderDetailRepository, OrderDetailRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IProductColorRepository, ProductColorRepository>();
            services.AddScoped<IProductImageRepository, ProductImageRepository>();
            services.AddScoped<IProductInSaleCampaignRepository, ProductInSaleCampaignRepository>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IProductVariantRepository, ProductVariantRepository>();
            services.AddScoped<IRatingRepository, RatingRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<ISaleCampaignRepository, SaleCampaignRepository>();
            services.AddScoped<ISizeRepository, SizeRepository>();
            services.AddScoped<IStatusLogRepository, StatusLogRepository>();
            services.AddScoped<ISuggestedOutfitRepository, SuggestedOutfitRepository>();
            services.AddScoped<ITicketChatRepository, TicketChatRepository>();
            services.AddScoped<ITransactionRepository, TransactionRepository>();
            services.AddScoped<ITryOnSlotRepository, TryOnSlotRepository>();
            services.AddScoped<IUserInteractionRepository, UserInteractionRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IWishlistRepository, WishlistRepository>();

            //Services
            services.AddScoped<IAiconversationService, AiconversationService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICharacteristicService, CharacteristicService>();
            services.AddScoped<IColorService, ColorService>();
            services.AddScoped<IMessageService, MessageService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IOrderDetailService, OrderDetailService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IProductColorService, ProductColorService>();
            services.AddScoped<IProductImageService, ProductImageService>();
            services.AddScoped<IProductInSaleCampaignService, ProductInSaleCampaignService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IProductVariantService, ProductVariantService>();
            services.AddScoped<IRatingService, RatingService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<ISaleCampaignService, SaleCampaignService>();
            services.AddScoped<ISizeService, SizeService>();
            services.AddScoped<IStatusLogService, StatusLogService>();
            services.AddScoped<ISuggestedOutfitService, SuggestedOutfitService>();
            services.AddScoped<ITicketChatService, TicketChatService>();
            services.AddScoped<ITransactionService, TransactionService>();
            services.AddScoped<ITryOnSlotService, TryOnSlotService>();
            services.AddScoped<IUserInteractionService, UserInteractionService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IWishlistService, WishlistService>();

            return services;
        }
    }
}
