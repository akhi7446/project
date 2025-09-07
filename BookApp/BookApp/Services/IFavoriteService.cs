using BookApp.Api.Models.DTOs;

namespace BookApp.Api.Services
{
    public interface IFavoriteService
    {
        Task<IEnumerable<BookDto>> GetFavoritesAsync(int userId);
        Task<bool> AddFavoriteAsync(int userId, int bookId);
        Task<bool> RemoveFavoriteAsync(int userId, int bookId);
    }
}
