# zeppelin-highcharts-columnrange

Column Range Chart for Apache Zeppelin using highcharts.js

## Usage

- Enable in the `/helium` page
- Set `xAxis`. Value of `xAxis` should be number type.
- Set `yAxis`. Value of `yAxis` should be category type.

## Screenshots 

![](https://raw.githubusercontent.com/1ambda/zeppelin-highcharts-columnrange/master/screenshots/usage.gif)

## Example Paragraph for Testing

```scala
import org.apache.commons.io.IOUtils
import java.net.URL
import java.nio.charset.Charset

// Zeppelin creates and injects sc (SparkContext) and sqlContext (HiveContext or SqlContext)
// So you don't need create them manually

// load bank data
val bankText = sc.parallelize(
    IOUtils.toString(
        new URL("https://s3.amazonaws.com/apache-zeppelin/tutorial/bank/bank.csv"),
        Charset.forName("utf8")).split("\n"))

case class Bank(age: Integer, job: String, marital: String, education: String, balance: Integer)

val bank = bankText.map(s => s.split(";")).filter(s => s(0) != "\"age\"").map(
    s => Bank(s(0).toInt, 
            s(1).replaceAll("\"", ""),
            s(2).replaceAll("\"", ""),
            s(3).replaceAll("\"", ""),
            s(5).replaceAll("\"", "").toInt
        )
).toDF()
bank.registerTempTable("bank")
```

```
%sql 
select age, job, marital, education, balance
from bank
limit 1000
```

## License

See [https://shop.highsoft.com/faq](https://shop.highsoft.com/faq)
