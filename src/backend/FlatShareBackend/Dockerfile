FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /App
EXPOSE 8080
EXPOSE 8081

# Copy everything
COPY . ./
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /App
COPY --from=build /App/out .
ENTRYPOINT ["dotnet", "FlatShareBackend.dll"]