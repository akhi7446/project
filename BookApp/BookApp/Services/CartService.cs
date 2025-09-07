using BookApp.Api.Data;
using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BookApp.Api.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CartItemDto>> GetCartAsync(int userId)
        {
            return await _context.CartItems
                .Where(c => c.UserId == userId)
                .Include(c => c.Book)
                .ThenInclude(b => b.Author)
                .Include(c => c.Book.Category)
                .Select(c => new CartItemDto
                {
                    BookId = c.BookId,
                    Title = c.Book.Title,
                    AuthorName = c.Book.Author.Name,
                    CategoryName = c.Book.Category.Name,
                    Genre = c.Book.Genre,
                    Price = c.Book.Price,
                    Quantity = c.Quantity,
                    ImageUrl = c.Book.ImageUrl
                })
                .ToListAsync();
        }

        public async Task<bool> AddToCartAsync(int userId, int bookId, int quantity)
        {
            var cartItem = await _context.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == bookId);

            if (cartItem != null)
            {
                cartItem.Quantity += quantity;
            }
            else
            {
                cartItem = new CartItem
                {
                    UserId = userId,
                    BookId = bookId,
                    Quantity = quantity
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFromCartAsync(int userId, int bookId)
        {
            var cartItem = await _context.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == bookId);
            if (cartItem == null) return false;

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearCartAsync(int userId)
        {
            var items = _context.CartItems.Where(c => c.UserId == userId);
            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
