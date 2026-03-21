using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FlatShareBackend.Models;
using FlatShareBackend.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FlatShareBackend.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly JwtOptions _jwtOptions;

        public JwtTokenService(IOptions<JwtOptions> jwtOptions)
        {
            _jwtOptions = jwtOptions.Value;
        }

        public string GenerateToken(User user, UserSession session)
        {
            var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("sid", session.Id.ToString()),
            new(ClaimTypes.Role, user.Role.ToString().ToUpperInvariant())
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = GetTokenExpirationUtc();

            var token = new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public int GetExpiresInSeconds()
        {
            return _jwtOptions.AccessTokenExpirationMinutes * 60;
        }

        public DateTime GetTokenExpirationUtc()
        {
            return DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenExpirationMinutes);
        }
    }
}