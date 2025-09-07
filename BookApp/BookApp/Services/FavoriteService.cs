using BookApp.Api.Data;
using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BookApp.Api.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly AppDbContext _context;

        public FavoriteService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BookDto>> GetFavoritesAsync(int userId)
        {
            return await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Book)
                .ThenInclude(b => b.Author)
                .Include(f => f.Book.Category)
                .Select(f => new BookDto
                {
                    Id = f.Book.Id,
                    Title = f.Book.Title,
                    AuthorName = f.Book.Author.Name,
                    CategoryName = f.Book.Category.Name,
                    Genre = f.Book.Genre,
                    Price = f.Book.Price,
                    ImageUrl = f.Book.ImageUrl
                })
                .ToListAsync();
        }

        public async Task<bool> AddFavoriteAsync(int userId, int bookId)
        {
            var exists = await _context.Favorites.AnyAsync(f => f.UserId == userId && f.BookId == bookId);
            if (exists) return false;

            var favorite = new Favorite { UserId = userId, BookId = bookId };
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFavoriteAsync(int userId, int bookId)
        {
            var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.BookId == bookId);
            if (favorite == null) return false;

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
