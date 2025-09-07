using BookApp.Api.Models.DTOs;
using BookApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IWebHostEnvironment _env;

        public UserController(IUserService userService, IWebHostEnvironment env)
        {
            _userService = userService;
            _env = env;
        }

        // 🔹 Register with optional file upload
        [HttpPost("register")]
        [AllowAnonymous]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // ✅ Save file if provided
                if (request.File != null && request.File.Length > 0)
                {
                    var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var uploadsFolder = Path.Combine(webRoot, "uploads", "profiles");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var fileName = $"{Guid.NewGuid()}_{request.File.FileName}";
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.File.CopyToAsync(stream);
                    }

                    // store relative path
                    request.ProfileImageUrl = $"/uploads/profiles/{fileName}";
                }

                var user = await _userService.RegisterAsync(request);

                // build full URL if image exists
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var profileImageUrl = string.IsNullOrEmpty(user.ProfileImageUrl)
                    ? null
                    : $"{baseUrl}{user.ProfileImageUrl}";

                return Ok(new
                {
                    message = "Registration successful",
                    user = new
                    {
                        user.Username,
                        user.FirstName,
                        user.LastName,
                        user.Email,
                        user.PhoneNumber,
                        ProfileImageUrl = profileImageUrl,
                        user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 Login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var token = await _userService.LoginAsync(request);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // 🔹 Get Profile (auth required)
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
            var user = await _userService.GetByIdAsync(userId);
            if (user == null) return NotFound();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var profileImageUrl = string.IsNullOrEmpty(user.ProfileImageUrl)
                ? null
                : $"{baseUrl}{user.ProfileImageUrl}";

            return Ok(new
            {
                user.Username,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                ProfileImageUrl = profileImageUrl,
                user.Role
            });
        }

        // 🔹 Upload Profile Image (after registration)
        [HttpPost("upload-profile-image")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProfileImage([FromForm] FileUploadDto dto)
        {
            var file = dto.File;
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var userId = int.Parse(User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRoot, "uploads", "profiles");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/profiles/{fileName}";
            await _userService.UpdateProfileImageAsync(userId, relativePath);

            // return full URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var profileImageUrl = $"{baseUrl}{relativePath}";

            return Ok(new { imageUrl = profileImageUrl });
        }

        // 🔹 Update Profile (auth required)
        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
            var user = await _userService.UpdateProfileAsync(userId, dto);

            // Return same shape as GetProfile with absolute image URL (to match your current behavior)
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var profileImageUrl = string.IsNullOrEmpty(user.ProfileImageUrl)
                ? null
                : $"{baseUrl}{user.ProfileImageUrl}";

            return Ok(new
            {
                user.Username,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                ProfileImageUrl = profileImageUrl,
                user.Role
            });
        }

    }
}
