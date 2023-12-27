# ![knox icon](/public/knox.svg) knox

Knox is a locally hosted password manager, created for my [OCR A-level Computer Science (H446)](https://www.ocr.org.uk/qualifications/as-and-a-level/computer-science-h046-h446-from-2015/) coursework.

## Documentation

The design, development and testing processes are documented in the [Project Report](/docs/Project%20Report.pdf), originally authored to submit with the coursework.

## Installation

On Linux and Mac systems, the installation process can be automated by running the included [bash script](/knox.sh).

```bash
git clone https://github.com/stmio/knox.git
cd knox
sh ./knox.sh
```

This script first checks if [node](https://nodejs.org/en) is available. If not, the most recent LTS version is installed with [nvm](https://github.com/nvm-sh/nvm/).

The required [npm](https://www.npmjs.com/) packages are also installed, and the project is built with [vite](https://vitejs.dev/). The production server can then be started.

To start the server again in the future, simply rerun the script.

### Manual Installation

1. Clone the repository: `git clone https://github.com/stmio/knox.git`
2. Ensure [node>=20.0.0](https://nodejs.org/en) and npm are installed and on your path
3. Install the required packages from Knox's base directory (`cd knox`): `npm install`
4. Start the server:

   - For production:

     - Build the project: `npm run build`
     - Start the server: `npm start`

   - For development:
     - Start the dev server: `npm run dev`

5. Navigate to Knox in your web browser, by default `localhost:3000`
