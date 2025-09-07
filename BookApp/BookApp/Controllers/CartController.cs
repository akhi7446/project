using BookApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // cart is tied to logged-in users
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // 🔹 Get cart items for logged-in user
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "id").Value);
            var cartItems = await _cartService.GetCartAsync(userId);
            return Ok(cartItems);
        }

        // 🔹 Add book to cart
        [HttpPost("{bookId}")]
        public async Task<IActionResult> AddToCart(int bookId, [FromQuery] int quantity = 1)
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "id").Value);
            var success = await _cartService.AddToCartAsync(userId, bookId, quantity);

            if (!success) return BadRequest(new { message = "Unable to add book to cart" });
            return Ok(new { message = "Book added to cart" });
        }

        // 🔹 Remove book from cart
        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveFromCart(int bookId)
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "id").Value);
            var success = await _cartService.RemoveFromCartAsync(userId, bookId);

            if (!success) return NotFound(new { message = "Book not found in cart" });
            return Ok(new { message = "Book removed from cart" });
        }

        // 🔹 Clear cart (checkout step)
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "id").Value);
            var success = await _cartService.ClearCartAsync(userId);

            if (!success) return BadRequest(new { message = "Unable to clear cart" });
            return Ok(new { message = "Cart cleared successfully" });
        }
    }
}
