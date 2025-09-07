using BookApp.Api.Models.DTOs;

namespace BookApp.Api.Services
{
    public interface ICartService
    {
        Task<IEnumerable<CartItemDto>> GetCartAsync(int userId);
        Task<bool> AddToCartAsync(int userId, int bookId, int quantity);
        Task<bool> RemoveFromCartAsync(int userId, int bookId);
        Task<bool> ClearCartAsync(int userId);
    }
}
