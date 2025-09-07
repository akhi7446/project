using BookApp.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace BookApp.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required] public string FirstName { get; set; }
        [Required] public string LastName { get; set; }
        [Required]public string Username { get; set; }


        [Required] public string PhoneNumber { get; set; }

        [Required, EmailAddress] public string Email { get; set; }

        [Required] public string PasswordHash { get; set; }

        public string? ProfileImageUrl { get; set; }

        public string Role { get; set; } = "User"; // "Admin" or "User" or Author

        public ICollection<Favorite> Favorites { get; set; }
        public ICollection<CartItem> CartItems { get; set; }
    }
}
