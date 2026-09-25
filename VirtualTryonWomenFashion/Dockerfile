# ----------- Build Stage -------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ./VirtualTryonWomenFashion.sln ./
COPY ./VirtualTryonWomenFashion.API/VirtualTryonWomenFashion.API.csproj ./VirtualTryonWomenFashion.API/
COPY ./VirtualTryonWomenFashion.Data/VirtualTryonWomenFashion.Data.csproj ./VirtualTryonWomenFashion.Data/
COPY ./VirtualTryonWomenFashion.Service/VirtualTryonWomenFashion.Service.csproj ./VirtualTryonWomenFashion.Service/

# Restore dependencies
RUN dotnet restore "VirtualTryonWomenFashion.sln"

# Copy the rest of the source code
COPY . .

# Publish the API project
WORKDIR /src/VirtualTryonWomenFashion.API
RUN dotnet publish VirtualTryonWomenFashion.API.csproj -c Release -o /app/publish

# ----------- Runtime Stage -------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "VirtualTryonWomenFashion.API.dll"]
