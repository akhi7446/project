using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;

namespace BookApp.Api.Services
{
    public interface IBookService
    {
        // Core CRUD
        Task<IEnumerable<BookDto>> GetAllAsync();
        Task<BookDto?> GetByIdAsync(int id);
        Task<BookDto> CreateAsync(BookDto dto, bool isApproved = true);
        Task<BookDto?> UpdateAsync(int id, BookDto dto);
        Task<bool> DeleteAsync(int id);

        // Queries
        Task<IEnumerable<BookDto>> SearchAsync(string query);
        Task<IEnumerable<BookDto>> FilterAsync(string? author, string? category, string? genre, decimal? minPrice, decimal? maxPrice);

        // Admin-only actions
        Task<Book?> ApproveAsync(int id);
    }
}
