using BookApp.Api.Models;

namespace BookApp.Api.Data
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            if (!context.Authors.Any())
            {
                context.Authors.AddRange(
                    new Author { Name = "J.K. Rowling" },
                    new Author { Name = "George R.R. Martin" },
                    new Author { Name = "J.R.R. Tolkien" }
                );
                context.SaveChanges();
            }

            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Fantasy" },
                    new Category { Name = "Adventure" },
                    new Category { Name = "Fiction" }
                );
                context.SaveChanges();
            }

            if (!context.Books.Any())
            {
                var author1 = context.Authors.FirstOrDefault(a => a.Name == "J.K. Rowling");
                var category1 = context.Categories.FirstOrDefault(c => c.Name == "Fantasy");

                context.Books.Add(new Book
                {
                    Title = "Harry Potter and the Philosopher's Stone",
                    Description = "A young wizard's journey begins.",
                    Price = 19.99M,
                    Genre = "Fantasy",
                    AuthorId = author1.Id,
                    CategoryId = category1.Id,
                    ImageUrl = "https://example.com/hp1.jpg"
                });

                context.SaveChanges();
            }
        }
    }
}
