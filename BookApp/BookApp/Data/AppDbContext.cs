using BookApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BookApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<BookRequest> BookRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ---------------------------
            // 🔹 Book Price Precision
            // ---------------------------
            modelBuilder.Entity<Book>()
                .Property(b => b.Price)
                .HasColumnType("decimal(18,2)");

            // ---------------------------
            // 🔹 CartItem Relationships
            // ---------------------------
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Book)
                .WithMany()
                .HasForeignKey(ci => ci.BookId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ---------------------------
            // 🔹 Favorite Relationships
            // ---------------------------
            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Book)
                .WithMany()
                .HasForeignKey(f => f.BookId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ---------------------------
            // 🔹 Book -> Author
            // ---------------------------
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Author)
                .WithMany(a => a.Books)
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.Cascade); // deleting an author deletes their books

            // ---------------------------
            // 🔹 Author -> User
            // ---------------------------
            modelBuilder.Entity<Author>()
                .HasOne(a => a.User)
                .WithMany() // no collection on User
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict); // prevent deleting User if linked to Author

            // ---------------------------
            // 🔹 Book -> Category
            // ---------------------------
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Category)
                .WithMany(c => c.Books)
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Cascade); // deleting category deletes books

            // ---------------------------
            // 🔹 BookRequest -> User
            // ---------------------------
            modelBuilder.Entity<BookRequest>()
                .HasOne(r => r.RequestedBy)
                .WithMany(u => u.BookRequests)
                .HasForeignKey(r => r.RequestedById)
                .OnDelete(DeleteBehavior.Cascade);

            // ---------------------------
            // 🔹 Unique Constraints
            // ---------------------------
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<Category>()
                .HasIndex(c => c.Name)
                .IsUnique();

            modelBuilder.Entity<Author>()
                .HasIndex(a => a.Name)
                .IsUnique();
        }
    }
}
