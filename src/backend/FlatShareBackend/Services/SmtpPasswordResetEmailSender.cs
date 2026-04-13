using System.Net;
using System.Net.Mail;
using FlatShareBackend.Options;
using Microsoft.Extensions.Options;

namespace FlatShareBackend.Services
{
    public class SmtpPasswordResetEmailSender : IPasswordResetEmailSender
    {
        private readonly SmtpOptions _options;

        public SmtpPasswordResetEmailSender(IOptions<SmtpOptions> options)
        {
            _options = options.Value;
        }

        public async Task SendPasswordResetAsync(
            string toEmail,
            string resetToken,
            DateTime expiresAtUtc,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_options.Host))
            {
                throw new InvalidOperationException("SMTP host is not configured.");
            }

            if (string.IsNullOrWhiteSpace(_options.FromEmail))
            {
                throw new InvalidOperationException("SMTP from email is not configured.");
            }

            using var message = new MailMessage
            {
                From = new MailAddress(_options.FromEmail, _options.FromName),
                Subject = "FlatShare password reset",
                Body = $"Use this one-time reset token: {resetToken}\nToken expires at: {expiresAtUtc:O}",
                IsBodyHtml = false
            };

            message.To.Add(new MailAddress(toEmail));

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                EnableSsl = _options.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            if (!string.IsNullOrWhiteSpace(_options.Username))
            {
                client.Credentials = new NetworkCredential(_options.Username, _options.Password);
            }

            await client.SendMailAsync(message);
        }
    }
}