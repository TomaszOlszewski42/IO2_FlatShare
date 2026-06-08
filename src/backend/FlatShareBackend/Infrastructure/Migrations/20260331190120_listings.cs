using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlatShareBackend.Migrations
{
    /// <inheritdoc />
    public partial class listings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerId1 = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    AvailableSince = table.Column<DateOnly>(type: "date", nullable: false),
                    OwnerContact = table.Column<string>(type: "text", nullable: false),
                    Area = table.Column<decimal>(type: "numeric", nullable: false),
                    AvailableUntil = table.Column<DateOnly>(type: "date", nullable: false),
                    Location_City = table.Column<string>(type: "text", nullable: false),
                    Location_District = table.Column<string>(type: "text", nullable: false),
                    Location_Street = table.Column<string>(type: "text", nullable: false),
                    Location_AptNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Listings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Listings_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Listings_Users_OwnerId1",
                        column: x => x.OwnerId1,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Listings_Id",
                table: "Listings",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Listings_OwnerId",
                table: "Listings",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_OwnerId1",
                table: "Listings",
                column: "OwnerId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Listings");
        }
    }
}
