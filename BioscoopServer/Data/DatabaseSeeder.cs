using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;

namespace BioscoopServer.Data
{
    public static class DatabaseSeeder
    {
        public static void SeedDemoAccount(CinemaContext context)
        {
            // Check if demo account already exists
            var demoEmail = "johndoe@test.test";
            var existingUser = context.Users.FirstOrDefault(u => u.Email == demoEmail);

            if (existingUser == null)
            {
                // Create demo account with HASHED password
                var demoUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = demoEmail,
                    Password = BCrypt.Net.BCrypt.HashPassword("123456"), // Hash the password!
                    FirstName = "John",
                    LastName = "Doe"
                };

                context.Users.Add(demoUser);
                context.SaveChanges();

                Console.WriteLine($"✅ Demo account created: {demoEmail}");
                Console.WriteLine($"   User ID: {demoUser.Id}");
                Console.WriteLine($"🔒 Password hashed with BCrypt");
            }
            else
            {
                Console.WriteLine($"ℹ️  Demo account already exists: {demoEmail}");
                Console.WriteLine($"   User ID: {existingUser.Id}");
                
                // Check if password needs to be re-hashed (in case it was stored as plain text)
                if (!existingUser.Password.StartsWith("$2"))
                {
                    Console.WriteLine($"⚠️  Demo account password was not hashed, updating...");
                    existingUser.Password = BCrypt.Net.BCrypt.HashPassword("123456");
                    context.Users.Update(existingUser);
                    context.SaveChanges();
                    Console.WriteLine($"✅ Demo account password re-hashed");
                }
            }
        }
    }
}