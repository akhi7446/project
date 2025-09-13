using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookApp.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required] public string FirstName { get; set; }
        [Required] public string LastName { get; set; }
        [Required] public string Username { get; set; }
        [Required] public string PhoneNumber { get; set; }
        [Required, EmailAddress] public string Email { get; set; }
        [Required] public string PasswordHash { get; set; }

        public string? ProfileImageUrl { get; set; }
        public string Role { get; set; } = "User";

        [JsonIgnore]
        public ICollection<Favorite> Favorites { get; set; }
        [JsonIgnore]
        public ICollection<CartItem> CartItems { get; set; }
        [JsonIgnore]
        public ICollection<BookRequest> BookRequests { get; set; } = new List<BookRequest>();
    }
}
