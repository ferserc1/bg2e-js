# bg2e DB package

## Introduction

The bg2e db package is the one to be used to perform read and write operations on resources. It relies on other bg2 engine packages for this purpose.

The purpose of this package is to present a generic way to perform format and location independent writing and reading of resources.

To provide format independence, several resource types are established. Resource types are translated into objects in the graphics engine. A given file format can be loaded as one or several resource types: for example, a 3D model can be loaded as a mesh list, a drawable element or a scene node. The ability to handle different file formats, and translate them into certain resource types, is implemented by read and write plugins.

Location independence consists of allowing the loading of resources from various sources: for example, the file system, a server REST API or an HTTP file server.

## Resource types

The `ResourceType` object is a basic type of the graphics engine, so it is implemented in the base package:

```js
import { ResourceType } from 'bg2e/tools/Resource';

ResourceType.PolyList
ResourceType.Drawable
ResourceType.Node
ResourceType.Texture
ResourceType.Material
```

These resource types are translated into the following graphic engine objects:

- **`ResourceType.PolyList`**: bg2e/base/PolyList
- **`ResourceType.Drawable`**: bg2e/scene/Drawable
- **`ResourceType.Node`**: bg2e/scene/Node
- **`ResourceType.Texture`**: bg2e/base/Texture
- **`ResourceType.Material`**: bg2e/base/Material

## Loader and writer

The Loader and Writer classes are the link between file loading plugins, resource types and data sources. Both classes are very similar: they are used through one or several instances and their functionality is implemented through plugins.

The main differences between the two classes are that the Loader class includes a resource cache (which is stored in the instance, then there is a cache for each instance) and in the parameterization of the functions:

- Load functions receive a path or URL as a parameter, and return the object associated with the resource type.
- Write functions receive a path or URL as a parameter, and the object associated with the resource type.

Otherwise, all load or write functions are asynchronous.



