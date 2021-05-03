# Sculpting App Prototype

This app is a very basic start to a sculpting app like ZBrush or Blender.

# Note to Employers

This project was created to be a refresher and eventually a portfolio piece after a small absence from programming. I wanted to relearn some OpenGL and thought that trying a sculpting app would cover some of the concepts, and I wanted to start on learning the basics of web development and javascript.

I have been working on this project part-time while filling in the many gaps in my development experience, and intend it to be something that I can continue to improve as I go. As of writing this the app is not close to any sort of production or anything, and there are a lot of things in terms of code quality that I need to iron out. 

Ideally this learning process could be done in a working environment, so if any opportunities come up as I continue with the project it would be put on halt. If not then hopefully the project in the future can show a more established ability to develop for employers.

Also, for anyone reading this, any big criticisms or pointers for the logic of the program or things I may have overlooked is welcome.

# Program Overview


## Positioning the Cursor
The process of positioning the cursor on the mesh is done with a single raycast from the camera in a certain direction based on the mouse's position on the browser canvas. This also allows the cursor to be rotated to fit the normal of the triangle that it hit to match the curve of the mesh.

I hadn't done any raytracing so there aren't any serious optimizations implemented, only the Möller–Trumbore algorithm and a DDA/Grid Acceleration structure. To update the acceleration structure as the mesh is deformed, I naively put the (indices of) changed triangles into a buffer that is always tested against, then re-make the structure when the buffer gets too large.

### **TODO**
This setup works for the very light workload of one ray per frame and allows the raytracing step to clear the 16.7ms target easily, so further improvements would be down the line or if I wanted to go deeper with raytracing. There are some important things to consider though:
- With a "shell" mesh, like the sphere used in the program now, a grid structure has a lot of wasted space in the middle. A better system would use something else like an octree. I think this also solves the problem of the grid resolution formula neding to be tweaked far outside of the recommended bounds to get the right balance of creation time vs performance (0.1 is used right now, between 3 and 5 was recommended in tutorial)

- In a serious program, there is probably a better way to handle the mesh deformation than the buffer/re-make way. If the structure does have to be re-made then it could be done in parallel, which it doesn't right now

- Any type of rendering raytracing with way more rays is a whole other project 
## Testing the vertices

This is the part of the program that will be looked at next, because there are a few things which could be improved. In order to support different cursor shapes other than a circle, the points have to be tested to check if they are inside the cursor polygon, instead of just testing with the radius of the circle and a certain depth. To do this, the points are projected from their world position onto the cursor plane, then an inside-outside winding number test is run on them in those 2 dimensions.

Right now this is done with a projection matrix, which might be overkill and is something I have to look into more, but the workaround in use now is storing a vertex edge list. This allows you to search the graph of vertices breadth first and only project and test the vertices that are within a given range.

**TODO**

- More sound bound checking for any given cursor is needed. It needs to calculate a bounding box based on the cursor's dimensions and user-defined depth, which doesn't exist right now.

- In addition to the above, if the cursor bounding box gets too large the breadth-first-search becomes detrimental. Some of the performance responsibility can be put on a user in a real scenario to not try to modify so many vertices at once, but there could still be some improvements for such cases

- When the cursor is rotated to match the triangle's normal, it's plane could be defined with any up and right vector orthogonal to the new normal. Right now these are vectors defined by the rotation applied to the cursor's original up vector (0, 1, 0), but there's some erratic movement which could be ironed out

- In general the cursor functionality needs work when the shape of the mesh becomes more irregular and the cursor matches to the triangle normals. Vertices above the cursor can be included in the check, and edge cases and vertices not facing the cursor need to be handled in some way.

# Performance

## Javascript
This topic goes a lot farther beyond any of the performance problems that I've dealt with in this project, and is definitely something I need to learn more about before really understanding the drawbacks of languages.

The one problem that really needed to be kept in mind was memory allocation and garbage collection. In the functions that get called very frequently, like the ray triangle intersect, any allocation of variables or arrays to hold vectors comes at a large price. To avoid this as much as possible, variables can be defined and allocated somewhere outside of the functions and filled and accessed when needed.

Again, I don't know if this problem is even caused by Javascript and need to look into things like compiled vs interpreted languages, strong and weak variable types, general memory allocation, and how javascript runs on the browser to get a better picture. But the biggest takeaway is that writing functions without this in mind and defining variables for convenience and cleaner code without any thought for performance can't be done.

## Current Performance and Problems TODO

*The eventual goal is to solve these problems and get rid of this section, but for now it serves as a known problems/TODO list for backend performance as I work on frontend or other things*

Some work was done on the Breadth-first-search and cutting down on using push(), which resulted in a performance boost that now allows the browser mousemove() function to be under 16.67 ms. This was done using a fixed length data structure for the queue, and storing whether a vertex has been visited or not in the current BFS in the DataArrays object to not use includes() or any other iteration over the vertices that are returned in the search. These changes introduce some other problems, like having to define a maximum length for the queue and visited array (which is hard coded right now but could be done when the mesh geometry is defined or read from a file), and adding more memory requirements in exchange for performance. The memory added doesn't seem to be too large compared to the mesh data though, as each vertex only needs an integer index and a boolean to be additionally stored.

The next issue in the call tree is the draw function. In the Gecko section the draw function doesn't take much time, and according to mozilla docs idle time can be sampled as Gecko, so this section can be ignored. The other draw function under tools shows a bug chunk of time, which after improving the BFS is now the majority in terms of cost. In general I need to look into how well webgl should perform for different sized workloads compared to the resolution of the mesh now, and make sure that I didn't overlook any big performance hits in the draw function itself (which I might have).

Now that the 60 fps target has been sort of hit, the priority for work would move to some other things though, so these further imporvements might be down the line.