using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlatShareBackend.Migrations
{
    /// <inheritdoc />
    public partial class DateRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "To",
                table: "DateRange",
                newName: "Until");

            migrationBuilder.RenameColumn(
                name: "From",
                table: "DateRange",
                newName: "Since");

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "DateRange",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Message",
                table: "DateRange");

            migrationBuilder.RenameColumn(
                name: "Until",
                table: "DateRange",
                newName: "To");

            migrationBuilder.RenameColumn(
                name: "Since",
                table: "DateRange",
                newName: "From");
        }
    }
}
