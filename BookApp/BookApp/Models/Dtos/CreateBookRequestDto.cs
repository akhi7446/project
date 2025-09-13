using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BookApp.Api.Models.DTOs
{
    public class CreateBookRequestDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string AuthorName { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Genre { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        // Optional files
        public IFormFile? CoverImage { get; set; }
        public IFormFile? SamplePdf { get; set; }
    }
}
