using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlatShareBackend.Migrations
{
    /// <inheritdoc />
    public partial class PaymentsInBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Payment_Currency",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Payment_Id",
                table: "Bookings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Payment_Status",
                table: "Bookings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Payment_TotalValue",
                table: "Bookings",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Payment_Currency",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Payment_Id",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Payment_Status",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Payment_TotalValue",
                table: "Bookings");
        }
    }
}
