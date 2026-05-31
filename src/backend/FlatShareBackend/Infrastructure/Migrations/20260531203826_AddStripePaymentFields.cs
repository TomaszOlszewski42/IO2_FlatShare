using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlatShareBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddStripePaymentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Payment_CreatedAt",
                table: "Bookings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Payment_Provider",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Payment_StripePaymentIntentId",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Payment_StripeSessionId",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Payment_UpdatedAt",
                table: "Bookings",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Payment_CreatedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Payment_Provider",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Payment_StripePaymentIntentId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Payment_StripeSessionId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Payment_UpdatedAt",
                table: "Bookings");
        }
    }
}
