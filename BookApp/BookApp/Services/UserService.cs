using BookApp.Api.Data;
using BookApp.Api.Helpers;
using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BookApp.Api.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public UserService(AppDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<User> RegisterAsync(RegisterRequest request)
        {
            // Ensure username + email are unique
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email is already in use.");

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                throw new Exception("Username is already taken.");

            var user = new User
            {
                Username = request.Username,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                // ✅ Use BCrypt for hashing
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                ProfileImageUrl = request.ProfileImageUrl,
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<string> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Invalid credentials");

            return _jwtHelper.GenerateToken(user);
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> UpdateProfileImageAsync(int userId, string imageUrl)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            user.ProfileImageUrl = imageUrl;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new Exception("User not found");

            if (!string.IsNullOrWhiteSpace(dto.FirstName))
                user.FirstName = dto.FirstName.Trim();

            if (!string.IsNullOrWhiteSpace(dto.LastName))
                user.LastName = dto.LastName.Trim();

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber.Trim();

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}
