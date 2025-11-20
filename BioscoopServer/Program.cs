using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using BioscoopServer.DBServices;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<CinemaContext>(options =>
    options.UseSqlite("Data Source=cinema.db"));

builder.Services.AddScoped<DBFilmService>();
builder.Services.AddScoped<DBUserService>();
// builder.Services.AddScoped<ReviewServices>();
builder.Services.AddScoped<DBRoomService>();
builder.Services.AddScoped<DBShowService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
