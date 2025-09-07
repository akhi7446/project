using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;
using System.Threading.Tasks;

namespace BookApp.Api.Services
{
    public interface IUserService
    {
        Task<User> RegisterAsync(RegisterRequest request);
        Task<string> LoginAsync(LoginRequest request);
        Task<User> GetByIdAsync(int id);
        Task<User> UpdateProfileImageAsync(int userId, string imageUrl);
        Task<User> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    }
}
