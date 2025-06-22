module hex_grid(width, height, hex_diameter, thickness) {
    intersection() {
        cube([width, thickness, height]);
        hex_grid_inner(width, height, hex_diameter, thickness);
    }
}

module hex(x, z, r, thickness) {
    translate([x, thickness, z]) rotate([90, 0, 0]) cylinder(h=2 * thickness, r=r, $fn=6);
}

module hex_grid_inner(width, height, hex_radius, thickness) {
    x_size = ceil(width / hex_radius);
    z_size = ceil(height / hex_radius);
    
    sqrt_3 = sqrt(3);
    
    for (z=[0:1:z_size]) {
        for (x=[0:1:x_size]) {
            z_position = 2 * z * hex_radius *sqrt_3 / 2;
            
            if (x % 2 == 0) {
                x_position = 1.5 * x * hex_radius;
                difference() {
                    hex(x_position, z_position, hex_radius, thickness);
                    hex(x_position, z_position, hex_radius - thickness, 2 * thickness);
                }
            }
            else {
                x_position = 1.5 * x * hex_radius;
                 difference() {
                    hex(x_position, z_position - hex_radius * sqrt_3 / 2, hex_radius, thickness);
                     hex(x_position, z_position - hex_radius * sqrt_3 / 2, hex_radius - thickness, 2 * thickness);
                 }
                
            }
        }
    }
}

    module big_side(width, height, hex_radius, thickness) {
    middle_width = 0.3 * width;
    side_width = (width - middle_width) / 2;    
    
    union() {
        hex_grid(side_width, height, hex_radius, thickness);
        translate([side_width, 0, 0]) cube([middle_width, thickness, height]);
        translate([side_width + middle_width, 0, 0])  hex_grid(side_width, height, hex_radius, thickness);
    }        
}

module frame(depth, length, height, thickness, offset) {
    difference() {
        cube([length, depth, height]);
        translate([thickness, thickness, thickness]) cube([length - 2 * thickness, depth - 2 * thickness, 2 * height]);
        translate([-length, offset, offset]) cube([3 * length, depth - 2 * offset, height - 2 * offset]);
        translate([offset, -depth, offset]) cube([length - 2 * offset, 3 * depth, height - 2 * offset]);
    }
}

module hex_frame(depth, length, height, offset, hex_radius, thickness) {
    translate([thickness, offset, offset]) rotate([0, 0, 90]) hex_grid(depth - 2 * offset, height - 2 * offset, hex_radius, thickness);
    translate([length, offset, offset]) rotate([0, 0, 90]) hex_grid(depth - 2 * offset, height - 2 * offset, hex_radius, thickness);
    translate([offset, 0, offset]) big_side(length - 2 * offset, height - 2 * offset, hex_radius, thickness);
    translate([offset, depth - thickness, offset]) big_side(length - 2 * offset, height - 2 * offset, hex_radius, thickness);
}

module handle(depth, length, height) {
    translate([length / 2, 2 * depth, height]) rotate([90, 0, 0]) cylinder(h=3*depth, r=length * 0.1, $fn=50);
}


module cover(depth, length, height, hex_radius, thickness, offset_factor) {
    length = length + 2 * thickness;
    depth = depth + 2 * thickness;
    offset = depth * offset_factor;
    
    difference() { 
        union() {
            frame(depth, length, height, thickness, offset);
            hex_frame(depth, length, height, offset, hex_radius, thickness);
        }
        handle(depth, length, height);
    }
}


offset = __offset__;
length = __length__;
depth = __depth__;
height = __height__;
thickness = __thickness__;
hex_radius = __hex_radius__;

cover(depth + offset, length + offset, height + offset, hex_radius, thickness, 0.2);