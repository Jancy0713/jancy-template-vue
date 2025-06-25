swaggerDirName="src/service/swagger-service"
# swagger地址
baseUrl="http://192.168.50.79:3000/api-docs/swagger.json"


rm -rf $swaggerDirName
mkdir  $swaggerDirName

java -jar ./scripts/openapi-generator-cli.jar generate \
    --additional-properties=enumPropertyNaming=original \
    -i $baseUrl \
    -g typescript-rxjs -o $swaggerDirName --skip-validate-spec

