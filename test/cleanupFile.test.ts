import { cleanupFile } from '../utils';
import { expect } from 'chai';

const baseFileContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>test</title>
    <link rel="stylesheet" href="style_2.css">
    <link ref="icon" href="favicon_5.png">
  </head>
  <body>
    <div>
      <p>
      <span>Lorem ipsum</span>
      </p>
    </div>
    <script src="script.js" nonce="dYdsmmm4854%cfedzfefef014">
    {
      user: {
        "permissionsHash": "233257b7076c6aa824ac0fa7abdd775c42bdb2ebf0cb4a37d3eaeedfd222a7d7"
      }
    }
    </script>
  </body>
</html>
`;

const cleanedFileContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>test</title>
    <link rel="stylesheet" href="style.css">
    <link ref="icon" href="favicon.png">
  </head>
  <body>
    <div>
      <p>
      <span>Lorem ipsum</span>
      </p>
    </div>
    <script src="script.js">
    {
      user: {
        "permissionsHash": ""
      }
    }
    </script>
  </body>
</html>
`;

const jsonTest = {
  date: 12348951,
  lorem: {
    data: 'yes',
    yes: 1,
  },
};

describe('Testing files duplication cleanup', () => {
  it('should cleanup duplicated files name', () => {
    expect(cleanupFile(`<link ref="icon" href="favicon_5.png">`)).to.equal(`<link ref="icon" href="favicon.png">`);
  });

  it('should NOT cleannup json prop value', () => {
    expect(cleanupFile(`{id: 'STUD_3QTR'}`)).to.equal(`{id: 'STUD_3QTR'}`);
  });

  it('should cleanup multiple duplicated files name', () => {
    expect(cleanupFile(`<link ref="icon" href="favicon_5.png"><link ref="icon" href="test_8.png">`)).to.equal(
      `<link ref="icon" href="favicon.png"><link ref="icon" href="test.png">`
    );
  });
  it('should NOT cleanup non duplicated files name', () => {
    expect(cleanupFile(`<link ref="icon" href="favicon_toto.png">`)).to.equal;
  });
  it('should NOT cleanup non duplicated files name', () => {
    expect(cleanupFile(`<link ref="icon" href="favicon_toto.png">`)).to.be.equal;
  });

  it('should NOT cleanup basic css class name', () => {
    expect(cleanupFile(`<div class="tds-flex-item tds-flex--col_1of3">`)).to.be.equal;
  });

  it('should NOT cleanup basic a div id or params', () => {
    expect(cleanupFile(`<div id="showcase--MzndJR_N_8w" data-gtm-drawer="showcase--MzndJR_N_8w">`)).to.be.equal;
  });
});

describe('Testing nonce param cleanup', () => {
  it('should clean up nonce tag in script tags', () => {
    expect(cleanupFile(`<script src="lorem.js" nonce="14Pm%5669jY">`)).to.equal(`<script src="lorem.js">`);
  });

  it('should clean up nonce tag in multiple scripts tags', () => {
    expect(cleanupFile(`<script src="lorem.js" nonce="14Pm%5669jY"><script src="ipsum.js" nonce="14uum%5658jY">`)).to.equal(
      `<script src="lorem.js"><script src="ipsum.js">`
    );
  });

  it('should NOT change script tags if there is no nonce tag', () => {
    expect(cleanupFile(`<script src="lorem.js">`)).to.equal;
  });
});

describe('Testing permissionHash cleanup', () => {
  it('should clean up the permission hash', () => {
    expect(cleanupFile(`"permissionsHash": "233257b7076c6aa824ac0fa7abdd775c42bdb2ebf0cb4a37d3eaeedfd222a7d7"`)).to.equal(`"permissionsHash": ""`);
  });
});

describe('Testing all cleanups', () => {
  it('should do all cleanups in one string', () => {
    expect(cleanupFile(baseFileContent)).to.equal(cleanedFileContent);
  });
});

describe('Testing JSON cleanup', () => {
  it('should clean up JSON', () => {
    const json = JSON.stringify(jsonTest);
    const cleanedJson = JSON.stringify({
      date: 0,
      lorem: {
        data: 'yes',
        yes: 1,
      },
    });
    expect(cleanupFile(json)).to.equal(cleanedJson);
  });
});
