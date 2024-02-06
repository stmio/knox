#!/bin/bash

set -e
echo "Welcome to Knox's installation and server management script."
echo ""

# Check if node is installed (and install it if not)
export NVM_DIR=~/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
if ! which node > /dev/null
    then
        echo "Node is not installed. This is required as Knox's runtime."
        read -p "Install node? (y/n) " iNode

        if [ "$iNode" = "y" ]
            then
                echo ""
                echo "Installing node using nvm..."

                # Install node version manager (nvm) https://github.com/nvm-sh/nvm/
                mkdir -p $NVM_DIR
                curl -sL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh \
                > ${NVM_DIR}/install.sh
                bash ${NVM_DIR}/install.sh > /dev/null 2>&1
                . ${NVM_DIR}/nvm.sh # Makes "nvm" command executable in shell
                echo "nvm v`nvm --version` has been installed!"

                # Install current LTS version of node
                nvm install --lts > /dev/null
                nvm use --lts > /dev/null
                echo "Current LTS version of node (`node --version`) has been installed!"

                # Update npm to latest version
                npm install -g npm > /dev/null
                echo "npm has been updated to the latest version (v`npm --version`)!"

                echo "Node has been installed sucessfully!"
                echo "You can uninstall all node versions at any time with 'rm -rf $NVM_DIR' (be careful!)"
                echo ""
            else
                exit 1
            fi
    else
        echo "Node is already installed, continuing..."
    fi

# Check script is running from knox's base directory
# TODO: Check for package.json as well
pkgName=$(npm pkg get name 2>/dev/null | tr -d '"')
if [ "$pkgName" != "knox" ]
    then
        echo ""
        echo "Script is not running from Knox's base directory."
        echo "Please change into the directory with the command 'cd /path/to/knox'"
        exit 1
    else
        echo "In Knox's base directory, continuing..."
    fi

# Install npm packages
# TODO: Ask user for confirmation?
echo "Installing required packages for Knox..."
npm install > /dev/null

# TODO: npm audit

# Build project with vite
echo "Building Knox from source..."
npm run build

# Ready to start the production server
# TODO: Add config/server management
echo ""
read -p "Knox is ready! Start the server now? (y/n) " startKnox
if [ "$startKnox" = "y" ]
    then
        npm start
    else
        echo "OK - run this script again at any time to start the server."
    fi
