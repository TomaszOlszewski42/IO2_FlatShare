using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlatShareBackend.Migrations
{
    /// <inheritdoc />
    public partial class dataRangeUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "From",
                table: "DateRange",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<DateOnly>(
                name: "To",
                table: "DateRange",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "From",
                table: "DateRange");

            migrationBuilder.DropColumn(
                name: "To",
                table: "DateRange");
        }
    }
}
