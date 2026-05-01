using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlatShareBackend.Migrations
{
    /// <inheritdoc />
    public partial class ListingAttributes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Attributes_CloseToShops",
                table: "Listings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Attributes_NonSmokingOnly",
                table: "Listings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Attributes_PetsAllowed",
                table: "Listings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Attributes_Profile",
                table: "Listings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Attributes_CloseToShops",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "Attributes_NonSmokingOnly",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "Attributes_PetsAllowed",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "Attributes_Profile",
                table: "Listings");
        }
    }
}
