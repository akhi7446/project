using System.ComponentModel.DataAnnotations;

namespace BookApp.Api.Models.DTOs
{
    public class RegisterRequest
    {
        [Required] public string Username { get; set; }   // must be unique
        [Required] public string FirstName { get; set; }
        [Required] public string LastName { get; set; }
        [Required] public string PhoneNumber { get; set; }
        [Required, EmailAddress] public string Email { get; set; }
        [Required] public string Password { get; set; }

        // file uploaded from form
        public IFormFile? File { get; set; }

        // 🔹 optional: save after upload
        public string? ProfileImageUrl { get; set; }
    }
}
