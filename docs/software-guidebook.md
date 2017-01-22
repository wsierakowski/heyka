## 1. Introduction

This software guidebook provides an overview of the Heyka Blog web application. It includes a summary of the following:

1. The requirements, constraints and principles behind the website.
2. The software architecture, including the high-level technology choices and structure of the software.
3. The infrastructure architecture and how the software is deployed.
4. Operational and support aspects of the application.

## 2. Context

The Heyka web application provides a simple and fast Blog system that reads articles and all metadata from the git repository like GitHub. It generates menu based on categories, renders list of tags based on the JSON configuration files for each article, displays number of views for each page and fetches article comments from external system like Disqus.

Here's a context diagram that provides a visual summary of this:
![Heyka CMS context diagram](/imgs/heyka-cms-c4-context.svg)

The purpose of the application is to make it easy to set up a blog without a need to maintain any database, learn admin panel and go through excess of configuration choices.

### 2.1 Users

Heyka Blog doesn't have any built in admin panel, the only way to edit the content and look are article files or JSON configuration files stored in the repository. Therefore the only type of the user from the system point of view is the blog consumer - an anonymous person with a web browser that can view content on the site.

### 2.2 External Systems

There are three type of systems that Heyka Blog integrates with. These are represented by dashed grey boxes on the context diagram.

1. **GitHub**: Git repository where blog content is read from, this includes articles along with the configuration JSON files.
2. **Disqus**: Feature-rich comment system complete with social network integration, advanced administration and moderation options, and other extensive community functions.
3. **VisitsCounter**: Simple service providing visitors count for each article in the blog.

## 3. Functional Overview

This section provides a summary of the functionality provided by the Heyka blog application.

## 4. Quality Attributes

## 5. Constraints

## 6. Principles

## 7. Software Architecture

### 7.1 Containers

### 7.3 Components (1)

### 7.4 Components (2)

### 7.5 Components (3)

## 8. Configuration

### 8.1 Overview

There are two types of configuration concerning the blog application:
- Content of the blog is controlled from the repository: directories and configuration files kept along the blog articles
- Blog configuration in regards to system settings and repository access are kept in the local configuration JSON file.

### 8.2 Directory Structure

Directories in the source repository become category names in the blog. Files kept in each directory are going to be accessible from the corresponding categories.

File names in each category should be unique.

Each article file has a corresponding configuration file containing article title, tags and other optional settings.

Example directory structure in the repository:

```bash
.
├── conf-global.json
├── news
│   ├── ai-machine-learning-meetup-dublin.json
│   ├── ai-machine-learning-meetup-dublin.md
│   ├── microservices-meetup-dublin-december.json
│   ├── microservices-meetup-dublin-december.md
│   ├── overview-of-nodeconfeu2016.json
│   └── overview-of-nodeconfeu2016.md
├── primers
├── tips
└── tutorials
```

Blog connected to the repository with the above directory and file structure will present the following category items to visitors:
- News
- Primers
- Tips
- Tutorials

The News category will list 3 articles. Each of these articles has corresponding configuration file providing article title, tags, published date and other optional settings.

### 8.3 Article Configuration File

Each article is required (in the initial release) to have a corresponding configuration file with the same name as the article file.

The two required values:
- title (string)
- publishedDate (string)

The optional values:
- tags (array of string)

Example configuration file:

```json
{
  "title": "AI and Machine Learning Meetup in Dublin",
  "publishedDate": "10-01-2017",
  "tags": ["meetups", "AI", "Machine Learning", "Dublin", "Python"]
}
```


### 8.4 System Configuration File

## 9. Infrastructure Architecture

## 10. Deployment

## 11. Operation and Support
