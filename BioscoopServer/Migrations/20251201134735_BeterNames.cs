using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BioscoopServer.Migrations
{
    /// <inheritdoc />
    public partial class BeterNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Eindtijd",
                table: "Shows",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "Begintijd",
                table: "Shows",
                newName: "EndDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Shows",
                newName: "Eindtijd");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "Shows",
                newName: "Begintijd");
        }
    }
}
