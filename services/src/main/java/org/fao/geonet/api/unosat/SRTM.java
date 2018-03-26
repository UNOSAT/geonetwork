package org.fao.geonet.api.unosat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

/**
 * Created by florent on 25/03/18.
 */

@Controller
public class SRTM {

    @Autowired
    JdbcTemplate jdbcTemplate;

    @RequestMapping(
            value = "api/srtm.profile",
            produces = MediaType.APPLICATION_JSON_VALUE,
            method = RequestMethod.POST)
    @ResponseStatus(value = HttpStatus.OK)
    @ResponseBody
    public String profile(
            @RequestParam JSONObject geom,
            @RequestParam String layers,
            @RequestParam int nbPoints,
            HttpServletRequest request) throws Exception {

        String geojson = geom.toString();

        final String sql = "WITH points_lonlat AS (\n" +
                "\tWITH geom AS (\n" +
                "\t  SELECT ST_SETSRID(ST_GeomFromGeoJSON('" + geojson + "'), 3857) geom\n" +
                "\t), points AS (\n" +
                "\t  SELECT id, \n" +
                "\t\t round((id * ST_Length(geom)::numeric)/99, 1) length, \n" +
                "\t\t ST_LineInterpolatePoint(geom, id/99.0) geom\n" +
                "\t  FROM generate_series(0, 99) id, \n" +
                "\t       geom\n" +
                "\t)\n" +
                "\tSELECT id, ST_Transform(geom, 3857) geom, length, \n" +
                "\t\tST_Value(rast, ST_Transform(geom, 4326)) elev\n" +
                "\tFROM points, \n" +
                "\t     srtm_100x100\n" +
                "WHERE ST_Intersects(rast, ST_Transform(geom, 4326))\n" +
                ")\n" +
                "SELECT elev, length, ST_X(geom) x, ST_Y(geom) y\n" +
                "from points_lonlat";

        JSONObject obj = new JSONObject();
        JSONArray points = new JSONArray();
        jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    JSONObject line = new JSONObject();
                    try {
                        line.put("dist", rs.getDouble("length"));
                        line.put("x", rs.getDouble("x"));
                        line.put("y", rs.getDouble("y"));
                        JSONObject values = new JSONObject();
                        values.put("srtm", rs.getDouble("elev"));
                        line.put("values", values);
                        return line;

                    } catch (JSONException e) {
                        return null;
                    }
                }).forEach(line -> points.put(line));

        obj.put("profile", points);
        return obj.toString();

    }
}
