using System.ComponentModel.DataAnnotations;

namespace BookApp.Api.Models.DTOs
{
    public class LoginRequest
    {
        [Required] public string Username { get; set; }
        [Required] public string Password { get; set; }
    }
}
