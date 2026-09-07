FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Docinator.slnx ./
COPY src/Docinator.Api/Docinator.Api.csproj src/Docinator.Api/
RUN dotnet restore src/Docinator.Api/Docinator.Api.csproj

COPY src/ ./src/
RUN dotnet publish src/Docinator.Api/Docinator.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_URLS=http://0.0.0.0:3001
EXPOSE 3001
ENTRYPOINT ["dotnet", "Docinator.Api.dll"]