/* @flow */

import { Task } from "atom";
import fs from "fs";
import Path from "path";
import temp from "temp";

temp.track();

describe("initial-scan-task", () => {
  let task, dir, addSpy, changeSpy, unlinkSpy;

  beforeEach(function() {
    const tempDirPath = temp.mkdirSync("empty-dir");
    dir = fs.realpathSync(tempDirPath);

    fs.writeFileSync(Path.join(dir, "note-1.txt"), "1");
    fs.writeFileSync(Path.join(dir, "note-2.txt"), "2");
    fs.writeFileSync(Path.join(dir, "other.zip"), "...");
    fs.writeFileSync(Path.join(dir, "note-3.txt"), "3");

    const taskPath = Path.join(__dirname, "..", "lib", "initial-scan-task.js");
    task = new Task(taskPath);

    addSpy = jasmine.createSpy("add");
    changeSpy = jasmine.createSpy("change");
    unlinkSpy = jasmine.createSpy("unlink");
    task.on("add", addSpy);
    task.on("change", changeSpy);
    task.on("unlink", unlinkSpy);

    let done = false;
    task.on("ready", () => {
      done = true;
    });
    const chokidarOptions: ChokidarOptions = {
      cwd: dir
    };
    task.start(chokidarOptions);
    waitsFor(() => done); // implicitly test INITIAL_SCAN_DONE
  });

  afterEach(function() {
    temp.cleanupSync();
    task.send("dispose");
    task.terminate();
  });

  it("should yield add events for each file found in dir", function() {
    expect(addSpy).toHaveBeenCalled();
    expect(addSpy.calls.length).toEqual(4);
    expect(addSpy.calls[0].args[0].filename).toEqual(jasmine.any(String));
    expect(addSpy.calls[0].args[0].stats).toEqual(jasmine.any(Object));
  });
});
