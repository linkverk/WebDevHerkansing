using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using BioscoopServer.DBServices;
using BioscoopServer.Data;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<CinemaContext>(options =>
    options.UseSqlite("Data Source=cinema.db"));

builder.Services.AddScoped<DBFilmService>();
builder.Services.AddScoped<DBUserService>();
builder.Services.AddScoped<DBReviewServices>();
builder.Services.AddScoped<DBRoomService>();
builder.Services.AddScoped<DBShowService>();
builder.Services.AddScoped<DBJwtService>();
builder.Services.Configure<LoggingPath>(builder.Configuration.GetSection("FileLoggingPath"));


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

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

builder.Configuration.AddUserSecrets<Program>();
var email = builder.Configuration["email"];
var passcode = builder.Configuration["passcode"];
EmailMaker.Initialize(email, passcode);

var app = builder.Build();

// Seed demo account on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CinemaContext>();
    
    // Ensure database is created
    context.Database.EnsureCreated();
    
    // Seed demo account
    DatabaseSeeder.SeedDemoAccount(context);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Use(async (context, next) =>
{
    LoggingPath Path = context.RequestServices.GetService<IOptions<LoggingPath>>().Value;
    string logPath = Path.FilePath;
    var logEntry = $"\nRequest from: {context.Connection.RemoteIpAddress}\n" +
                $"Protocol: {context.Request.Protocol}\n" +
                $"Method: {context.Request.Method}\n" +
                $"Time: {DateTime.Now}\n" +
                $"URL: {context.Request.Path}\n";

    await next.Invoke();

    logEntry += $"Response.StatusCode: {context.Response.StatusCode}\n\n";

    if (!System.IO.File.Exists(logPath))
    {
        await System.IO.File.WriteAllTextAsync(logPath, logEntry);
    }
    else
    {
        await System.IO.File.AppendAllTextAsync(logPath, logEntry);
    }
});

app.Run();

public class LoggingPath
{
    public string FilePath { get; set; }
}