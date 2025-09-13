using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class fyufc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "BookRequests",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "BookRequests");
        }
    }
}
