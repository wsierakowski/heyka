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

The purpose of the application is to:
1. Make it easy to set up a blog without a need to maintain any database, learn admin panel and go through excess of configuration choices.
2. ...
