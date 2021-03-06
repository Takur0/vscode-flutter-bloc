// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	context.subscriptions.push(vscode.commands.registerCommand('flutterBloc.addScreenFiles', async _ =>  {
		const fileName: string = (await inputNewFileName());
		var temp_arg: string | undefined = vscode.workspace.rootPath;
		if (temp_arg === undefined){
			temp_arg = 'undefined';
		}
    vscode.workspace.fs.createDirectory(vscode.Uri.file(temp_arg+`/lib/screen/`));
		const wsFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(temp_arg));
		if (wsFolder === undefined){
			vscode.window.showInformationMessage('Workspace is undefined. Please Open Folder.');
		} else {
		
		
			// vscode.workspace.updateWorkspaceFolders(0,0,{uri: vscode.Uri.parse('flutterProject:/')});

			try {
				vscode.workspace.fs.createDirectory(vscode.Uri.file(temp_arg+`/lib/screen/${fileName}/`));
			} catch (e){
				console.error(e);
			}

			try{
				vscode.workspace.fs.writeFile(vscode.Uri.file(temp_arg+`/lib/screen/${fileName}/${fileName}_bloc.dart`), Buffer.from(_generateBlocContent(wsFolder.name,fileName)));	
				vscode.workspace.fs.writeFile(vscode.Uri.file(temp_arg+`/lib/screen/${fileName}/${fileName}_const.dart`), Buffer.from(_generateConstContent(fileName)));	
				vscode.workspace.fs.writeFile(vscode.Uri.file(temp_arg+`/lib/screen/${fileName}/${fileName}_event.dart`), Buffer.from(_generateEventContent(fileName)));	
				vscode.workspace.fs.writeFile(vscode.Uri.file(temp_arg+`/lib/screen/${fileName}/${fileName}_page.dart`), Buffer.from(_generatePageContent(wsFolder.name,fileName)));	
				vscode.workspace.fs.writeFile(vscode.Uri.file(temp_arg+`/lib/screen/${fileName}/${fileName}_state.dart`), Buffer.from(_generateStateContent(fileName)));	
				vscode.workspace.fs.writeFile(vscode.Uri.file(temp_arg+`/lib/screen/${fileName}/${fileName}_view.dart`), Buffer.from(_generateViewContent(wsFolder.name,fileName)));	
        vscode.workspace.fs.writeFile(vscode.Uri.file(temp_arg+`/lib/screen/${fileName}/${fileName}.dart`), Buffer.from(_generateModuleContent(fileName)));	
        vscode.window.showInformationMessage(`${fileName} is created!`);
			} catch (e) {
				console.error(e);
			}
		}
  }));
  // TODO: implement addScreenTest Command 
  context.subscriptions.push(vscode.commands.registerCommand('flutterBloc.addScreenTest', async _ => {
    
  }));  
	
}

// this method is called when your extension is deactivated
export function deactivate() {}

async function inputNewFileName(){
	return (await vscode.window.showInputBox({ prompt: 'Input New Screen files ID.', placeHolder: 'new screen files ID, e.g. splash-screen', value: '_screen' })) || '';
}

function camelCase(str:string){
	str = str.charAt(0).toLowerCase() + str.slice(1);
	return str.replace(/[-_](.)/g, function(match, group1) {
		return group1.toUpperCase();
	});
}


function pascalCase(str:string){
	var camel = camelCase(str);
	return camel.charAt(0).toUpperCase() + camel.slice(1);
}
  

function _generateBlocContent(rootPath:string, fileName:string){
  return `import 'package:bloc/bloc.dart';
  import 'package:flutter/material.dart';
  import 'package:${rootPath}/screen/${fileName}/${fileName}.dart';
  
  class ${pascalCase(fileName)}Bloc extends Bloc<${pascalCase(fileName)}Event, ${pascalCase(fileName)}State> {
    @override
    ${pascalCase(fileName)}State get initialState => ${pascalCase(fileName)}UninitializedState();
  
    @override
    Stream<${pascalCase(fileName)}State> mapEventToState(
      ${pascalCase(fileName)}State currentState,
      ${pascalCase(fileName)}Event event,
    ) async* {
      // 画面が開始された場合
      if (event is ${pascalCase(fileName)}StartedEvent) {
        // 初期化された状態を返却
        yield ${pascalCase(fileName)}InitializedState();
  
        // 遷移中の状態を返却
        yield ${pascalCase(fileName)}ToNextScreenNavigatingState();
      }
  
      // 画面遷移が完了した場合
      if (event is ${pascalCase(fileName)}ToNextScreenNavigationCompletedEvent) {
        // 遷移完了の状態を返却
        yield ${pascalCase(fileName)}ToNextScreenNavigatedState();
      }
    }
  }
  `;
}

function _generateConstContent(fileName:string){
  return `const String TITLE = '${fileName}';
`;
}

function _generateEventContent(fileName:string){
  return `import 'package:equatable/equatable.dart';

abstract class ${pascalCase(fileName)}Event extends Equatable {}

// 画面の開始を通知
class ${pascalCase(fileName)}StartedEvent extends ${pascalCase(fileName)}Event {
  @override
  String toString() => '${pascalCase(fileName)}StartedEvent';
}

// 次画面への遷移完了を通知
class ${pascalCase(fileName)}ToNextScreenNavigationCompletedEvent
    extends ${pascalCase(fileName)}Event {
  @override
  String toString() => '${pascalCase(fileName)}ToNextScreenNavigationCompletedEvent';
}
`;
}

function _generatePageContent(rootParh:string, fileName:string){
  return `import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:${rootParh}/screen/${fileName}/${fileName}.dart';

class ${pascalCase(fileName)}Page extends StatefulWidget {
  final ${pascalCase(fileName)}Bloc ${camelCase(fileName)}Bloc;

  ${pascalCase(fileName)}Page({
    @required this.${camelCase(fileName)}Bloc,
  });

  @override
  _${pascalCase(fileName)}PageState createState() {
    return _${pascalCase(fileName)}PageState();
  }
}

class _${pascalCase(fileName)}PageState extends State<${pascalCase(fileName)}Page> {
  ${pascalCase(fileName)}Bloc get _${camelCase(fileName)}Bloc => widget.${camelCase(fileName)}Bloc;

  @override
  void initState() {
    super.initState();
    _${camelCase(fileName)}Bloc.dispatch(
      ${pascalCase(fileName)}StartedEvent(),
    );
  }

  @override
  void dispose() {
    _${camelCase(fileName)}Bloc.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder(
        bloc: _${camelCase(fileName)}Bloc,
        builder: (BuildContext context, ${pascalCase(fileName)}State state) {
          return Container(
            
          );
        },
      ),
    );
  }
}
`;
}

function _generateStateContent(fileName:string) {
	
	return `import 'package:equatable/equatable.dart';

abstract class ${pascalCase(fileName)}State extends Equatable {
	${pascalCase(fileName)}State([List props = const []]) : super(props);
}

// 初期化前の状態
class ${pascalCase(fileName)}UninitializedState extends ${pascalCase(fileName)}State {
	@override
	String toString() => '${pascalCase(fileName)}UninitializedState';
}

// 初期化された状態
class ${pascalCase(fileName)}InitializedState extends ${pascalCase(fileName)}State {
	@override
	String toString() => '${pascalCase(fileName)}InitializedState';
}

// 次画面へ遷移処理中の状態
class ${pascalCase(fileName)}ToNextScreenNavigatingState extends ${pascalCase(fileName)}State {
	@override
	String toString() => '${pascalCase(fileName)}ToNextScreenNavigatingState';
}

// 次画面へ遷移完了の状態
class ${pascalCase(fileName)}ToNextScreenNavigatedState extends ${pascalCase(fileName)}State {
	@override
	String toString() => '${pascalCase(fileName)}ToNextScreenNavigatedState';
}
`;
}

function _generateViewContent(rootPath:string, fileName:string) {
	
	return `import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:${rootPath}/screen/${fileName}/${fileName}.dart';

class ${pascalCase(fileName)}View extends StatefulWidget {
	@override
	_${pascalCase(fileName)}ViewState createState() => _${pascalCase(fileName)}ViewState();
}

class _${pascalCase(fileName)}ViewState extends State<${pascalCase(fileName)}View>{
	static ${pascalCase(fileName)}Bloc _${camelCase(fileName)}Bloc;

	@override
	void initState() {
		super.initState();
		_${camelCase(fileName)}Bloc = ${pascalCase(fileName)}Bloc();
	}

	@override
	void dispose() {
		_${camelCase(fileName)}Bloc.dispose();
		super.dispose();
	}

	@override
	Widget build(BuildContext context) {
		return ${pascalCase(fileName)}Page(
			${camelCase(fileName)}Bloc: _${camelCase(fileName)}Bloc,
		);
	}
}
`;
}

function _generateModuleContent(fileName:string) {
	return `export '${fileName}_bloc.dart';
export '${fileName}_const.dart';
export '${fileName}_event.dart';
export '${fileName}_page.dart';
export '${fileName}_state.dart';
export '${fileName}_view.dart';
`;
}

