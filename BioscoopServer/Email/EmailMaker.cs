using System.Net.Mail;
using Microsoft.AspNetCore.Builder;
public static class EmailMaker
{
    public static string Email { get; private set; }
    public static string Passcode { get; private set; }


    public static void Initialize(string email, string passcode)
    {
        Email = email;
        Passcode = passcode;
    }
    public static async Task MakeEmail(string ToEmail, bool IsTextHtml, string Subject, string text)
    {
        SmtpClient mailServer = new SmtpClient("smtp.gmail.com", 587);
        mailServer.EnableSsl = true;
        mailServer.Credentials = new System.Net.NetworkCredential(Email, Passcode);
        string from = Email;
        MailMessage msg = new MailMessage(from, ToEmail);
        msg.Subject = Subject;
        msg.IsBodyHtml = IsTextHtml;
        msg.Body = text;
        mailServer.Send(msg);
    }
}
