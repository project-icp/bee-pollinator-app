# Beescape raster data updates

## Background

The beescape application reads specially formatted geotiffs that adhere to a
naming convention that indicates the state, variable, and aggregated radius
contained in the dataset. These datasets are stored on an external storage
service called AWS S3, and are read remotely from the application code. To
update the data, new versions of the raster files can be uploaded to S3 and
they will be immediately used by the beescape application. The new files must
maintain the existing naming conventions and raster metadata exactly.

**Naming Conventions**

For each state, variable and radius combination, the file names are expected to
be assembled as:

`[STATE]_[VARIABLE]_[RADIUS].tif`

Example names are:

* `IL_floral_fall_3km.tif`
* `PA_floral_summer_5km.tif`

**Raster Metadata**

Metadata consistency is important for consistent analysis between updates.
Ensure that the projection, cell size, number of bands, and data types remain
the same. An example metadata output is:

    Driver: GTiff/GeoTIFF
    Files: IL_floral_summer_5km.tif
    Size is 2940, 5216
    Coordinate System is:
    PROJCS["unnamed",
        GEOGCS["GRS 1980(IUGG, 1980)",
            DATUM["unknown",
                SPHEROID["GRS80",6378137,298.257222101],
                TOWGS84[0,0,0,0,0,0,0]],
            PRIMEM["Greenwich",0],
            UNIT["degree",0.0174532925199433]],
        PROJECTION["Albers_Conic_Equal_Area"],
        PARAMETER["standard_parallel_1",29.5],
        PARAMETER["standard_parallel_2",45.5],
        PARAMETER["latitude_of_center",23],
        PARAMETER["longitude_of_center",-96],
        PARAMETER["false_easting",0],
        PARAMETER["false_northing",0],
        UNIT["metre",1,
            AUTHORITY["EPSG","9001"]]]
    Origin = (378585.000000000000000,2194905.000000000000000)
    Pixel Size = (120.000000000000000,-120.000000000000000)
    Metadata:
      AREA_OR_POINT=Area
      TIFFTAG_IMAGEDESCRIPTION=rastername: IL_floral_summer_5km, state: IL, CDLyear: 2017
    Image Structure Metadata:
      COMPRESSION=LZW
      INTERLEAVE=BAND
    Corner Coordinates:
    Upper Left  (  378585.000, 2194905.000) ( 91d21' 6.42"W, 42d40' 6.07"N)
    Lower Left  (  378585.000, 1568985.000) ( 91d41'57.51"W, 37d 5'10.39"N)
    Upper Right (  731385.000, 2194905.000) ( 87d 2'22.68"W, 42d26'33.05"N)
    Lower Right (  731385.000, 1568985.000) ( 87d42'25.09"W, 36d52'39.71"N)
    Center      (  554985.000, 1881945.000) ( 89d27'22.00"W, 39d47' 4.18"N)
    Band 1 Block=2940x1 Type=Float32, ColorInterp=Gray



## Instructions

To update the raster data, log into the AWS Console with the provided
credentials and upload the new files using the S3 dashboard using the steps
below.

**Credentials**

* URL:  https://467134525819.signin.aws.amazon.com/console
* Username: `beekeeper-data`
* Password: `<provided separately>`

**Upload a new dataset**

1. Log into the AWS Console
![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550084061408_file.png)

2. Navigate to the S3 Dashboard from the main page.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550084171548_file.png)

3. Open the `beekeepers-staging-data-us-east-1` bucket.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550084303960_file.png)

4. Open the folder corresponding to the aggregation radius
![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550084724181_file.png)

5. Click the `Upload` button and select the file on your system to upload. It
   should be replacing an existing tif and have the same exact file name.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550085076812_file.png)

6. Use the following settings when uploading the raster:
  - Object: ✅ Read; Object Permissions:  ✅Read,  ✅Write
  - Do not grant public read access to this object
  - Standard storage class
  - No encryption

![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550097261070_Screenshot+from+2019-02-13+173136.png)

![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550519610812_Screenshot+from+2019-02-18+145322.png)

![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550097303390_Screenshot+from+2019-02-13+173249.png)

![](https://d2mxuefqeaa7sj.cloudfront.net/s_6BE299F545FCF2593B762836DDCB999658CD6A5F7E8F2D741503E07F83F0F3C8_1550097325916_Screenshot+from+2019-02-13+173305.png)

7. After the upload is complete, test that the application still reads the
   raster correctly.

**Rolling back a bad update**

If the upload results in a broken application, first try and upload the
previous version of the raster. If it is unavailable, contact Azavea for
support. The S3 storage system automatically creates backups of each file and
we can restore to a previous version.

