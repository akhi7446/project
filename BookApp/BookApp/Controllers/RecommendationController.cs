using BookApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public RecommendationController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        // ✅ Get recommendations from OpenLibrary (via RecommendationService)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecommendations([FromQuery] string query = "books")
        {
            var recs = await _recommendationService.GetRecommendationsAsync(query);
            return Ok(recs);
        }
    }
}
