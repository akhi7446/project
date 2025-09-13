using BookApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // favorites are user-specific
    public class FavoriteController : ControllerBase
    {
        private readonly IFavoriteService _favoriteService;

        public FavoriteController(IFavoriteService favoriteService)
        {
            _favoriteService = favoriteService;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                        User.FindFirst("sub") ??
                        User.FindFirst("id") ??
                        User.FindFirst("nameid");

            if (claim == null || !int.TryParse(claim.Value, out var id))
            {
                throw new UnauthorizedAccessException("User id not found in token");
            }

            return id;
        }

        // 🔹 Get all favorites for logged-in user
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = GetUserId();
            var favorites = await _favoriteService.GetFavoritesAsync(userId);
            return Ok(favorites);
        }

        // 🔹 Add to favorites
        [HttpPost("{bookId}")]
        public async Task<IActionResult> AddFavorite(int bookId)
        {
            var userId = GetUserId();
            var success = await _favoriteService.AddFavoriteAsync(userId, bookId);

            if (!success) return BadRequest(new { message = "Already in favorites" });
            return Ok(new { message = "Book added to favorites" });
        }

        // 🔹 Remove from favorites
        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveFavorite(int bookId)
        {
            var userId = GetUserId();
            var success = await _favoriteService.RemoveFavoriteAsync(userId, bookId);

            if (!success) return NotFound(new { message = "Book not found in favorites" });
            return Ok(new { message = "Book removed from favorites" });
        }
    }
}
