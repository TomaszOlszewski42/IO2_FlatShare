using FlatShareBackend.API.Options;
using FlatShareBackend.Application.Ports;
using FlatShareBackend.Application.Services.Payments;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;

namespace FlatShareBackendTests.Services.Payments;

public class PaymentServiceTests
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<IPaymentGateway> _paymentGatewayMock;
    private readonly Mock<IOptions<StripeOptions>> _stripeOptionsMock;
    private readonly PaymentService _paymentService;

    public PaymentServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new AppDbContext(options);
        _paymentGatewayMock = new Mock<IPaymentGateway>();
        _stripeOptionsMock = new Mock<IOptions<StripeOptions>>();

        _stripeOptionsMock.Setup(o => o.Value).Returns(new StripeOptions { WebhookSecret = "whsec_test" });

        _paymentService = new PaymentService(_dbContext, _paymentGatewayMock.Object, _stripeOptionsMock.Object);
    }

    [Fact]
    public async Task PayForRentalAsync_ShouldThrow_WhenBookingDoesNotExist()
    {
        await Assert.ThrowsAsync<FlatShareBackend.Domain.Exceptions.InvalidIdException>(() =>
            _paymentService.PayForRentalAsync(Guid.NewGuid(), Guid.NewGuid()));
    }

    [Fact]
    public async Task PayForRentalAsync_ShouldThrow_WhenUserIsNotTenant()
    {
        var tenantId = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        
        var booking = new Booking
        {
            Id = bookingId,
            TenantId = tenantId,
            ListingId = Guid.NewGuid(),
            Status = BookingStatus.PendingPayment,
            Since = DateOnly.FromDateTime(DateTime.Now),
            Until = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
            TotalCost = 100,
            Currency = "pln"
        };
        _dbContext.Bookings.Add(booking);
        await _dbContext.SaveChangesAsync();

        var wrongUserId = Guid.NewGuid();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _paymentService.PayForRentalAsync(bookingId, wrongUserId));
    }

    [Fact]
    public async Task PayForRentalAsync_ShouldThrow_WhenBookingNotInPendingPaymentStatus()
    {
        var tenantId = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        
        var booking = new Booking
        {
            Id = bookingId,
            TenantId = tenantId,
            ListingId = Guid.NewGuid(),
            Status = BookingStatus.PendingApproval,
            Since = DateOnly.FromDateTime(DateTime.Now),
            Until = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
            TotalCost = 100,
            Currency = "pln"
        };
        _dbContext.Bookings.Add(booking);
        await _dbContext.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _paymentService.PayForRentalAsync(bookingId, tenantId));
    }

    [Fact]
    public async Task PayForRentalAsync_ShouldCreatePaymentAndReturnUrl()
    {
        var tenantId = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        
        var booking = new Booking
        {
            Id = bookingId,
            TenantId = tenantId,
            ListingId = Guid.NewGuid(),
            Status = BookingStatus.PendingPayment,
            Since = DateOnly.FromDateTime(DateTime.Now),
            Until = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
            TotalCost = 100,
            Currency = "pln"
        };
        _dbContext.Bookings.Add(booking);
        await _dbContext.SaveChangesAsync();

        _paymentGatewayMock.Setup(g => g.CreateCheckoutSessionAsync(It.IsAny<CreateCheckoutSessionCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CreateCheckoutSessionResult("sess_123", "http://checkout.stripe.com/sess_123"));

        var result = await _paymentService.PayForRentalAsync(bookingId, tenantId);

        Assert.NotNull(result);
        Assert.Equal("http://checkout.stripe.com/sess_123", result.CheckoutUrl);
        Assert.Equal(PaymentStatus.Redirected, result.Status);

        var paymentInDb = await _dbContext.Payments.FindAsync(result.PaymentId);
        Assert.NotNull(paymentInDb);
        Assert.Equal("sess_123", paymentInDb.ProviderSessionId);
    }
}
