Hacking on Open Source Media
=======

Introduction
-------

This document describes the general workflow and guidelines for hacking upon OSM. Although we provide a general workflow, you're free to use whatever workflow you're comfortable with providing it doesn't impact badly on the code you submit. If you don't plan on commiting your changes back to the main project, disregard that part and have a sad face :(.

Prerequisites
-------

You need either a Linux, Windows, or OSX machine to help develop OSM. These instructions will be pretty specific to Linux but they should be fairly staight forward in regards to what you need to do.

You need a few things installed before you can get started. These are non-optional for general development.

 - Git (`apt-get install git`/`yum install git`)
 - NodeJS - http://nodejs.org/download/ (I cannot recommend using a package from your distro as it's likely too old)
 - npm - Pretty sure this comes with Node now.
 - Node-webkit - https://github.com/rogerwang/node-webkit#downloads - Version 0.10.x
 - grunt-cli - `npm install -g grunt-cli`
 - Less - (`apt-get install less`/`yum install less`)

If you run in to any problems with these, it's likely because they're outdated.

I also have to recommend using [Sublime Text 3](http://www.sublimetext.com/3) as your code editor, but you can use Notepad as long as you write decent code.

Getting Started
-------

Firstly, you need to fork the project so you can push your work and create pull requests. Hit the `Fork` button above
if you haven't already. Then you need to clone your copy of OSM to your local machine. Simple, right?

```
$ cd ~/src
$ git clone git@github.com:YOUR_GITHUB_USERNAME/osm.git
$ cd osm
```
Presuming you replaced `YOUR_GITHUB_USERNAME` with your actual Github username (there's always one...), and you've setup your private keys, everything should have gone fine.

So now you should have your own fork of OSM and a working copy of OSM. Smiling kittens.

TBC
