#!/usr/bin/env python

# This version is 2019-08-05
# from __future__ import unicode_literals
import types, os, sys, re
import numpy.lib.recfunctions as rec
from collections import defaultdict as dd
import scipy.stats as stats
from matplotlib.lines import Line2D
import matplotlib.mlab as mlab
import matplotlib.pylab as pp
from sqlite3 import connect
import numpy as np
import matplotlib
import datetime
matplotlib.use('Agg')


def gettable(databasename, tablename):
	# Dumps an sqlite database table into a recarray.
	str_length = 200
	# It needs the path to the database
	db = connect(databasename)
	c = db.cursor()

	# Gets all data. All of the readers answers are stored in "A name of an configuration file"Answers
#	c.execute('select * from TutorialtestAnswers')
	c.execute('select * from "'+tablename+'"')

	# Gets all the different data types
	typesl = []
	for i in c.fetchone():
		if type(i) == np.unicode_:
		# if type(i) == unicode:
				typesl.append('U%s' % str_length)
		if type(i) == float:
				typesl.append('float')
		if type(i) == int:
				typesl.append('int')

	# Variable names
	varnm = [i[0] for i in c.description]

	# Autodetected dtype
	dtype = zip(varnm,typesl)
	c.execute('select * from "'+tablename+'"')
	data = np.fromiter(c, dtype)
	data= data.view(np.recarray) # Turn into recarray.

	# Closes the database connection
	db.close()
	return(data)


def sigim3(x):
	# A function that gets the truth state of the data.
	y = []
	s = x.solution
	p = x.prompt
	for i in range(len(x)):
		if 'blank' in s[i]:
			if 'Absent' in p[i]:
				y.append("-")
				continue
			if 'Present' in p[i]:
				y.append("+")
				continue
			y.append("N")
			continue
		if "No" not in s[i] and "blue" not in s[i]:
			y.append("+")
			continue
		y.append("-")
	return(np.array(y))


mtch = re.compile("\d+")


def score1(x):
	# More data munging.
	#	if type(x)==type(''):  # A string type
	if isinstance(x, types.StringTypes):  # A string type
		if 'clicked' in x:
			if 'clickedImage' in x:
				y = 100.
			if 'NoButton' in x:
				y = 0.
		elif 'not answer' in x:
			y = 0.
		else:
			digs = mtch.findall(x)
			if not digs:
				return(np.nan)
			y = digs[0]
	try:
		return(np.float(y))
	except:
		return(np.nan)


def score(x):  # Turn vector into scores
	return(np.array([score1(i) for i in x]))


def casename(x):  # Truncate names of prompts
	return(np.array([i.split('/')[-1] for i in x]))


def rmna(x):  # Remove the NAs and other bad stuff.
	return(x[np.isfinite(x)])


def by(name, func, x):  # My own version of the R by function.
	rtn = []
	lvls = np.unique(x[name])
	for lvl in lvls:
		try:
			y = x[x[name] == lvl]  # Scores for this reader
			yf = func(y)
			if yf:
				rtn.append(yf)  # rtn.append((func(y),lvl))
		except:
			pass
	return(rtn)


def bydict(name, func, x):  # My own version of the R by function. returns dict
	rtn = {}
	lvls = np.unique(x[name])
	for lvl in lvls:
		try:
			y = x[x[name] == lvl]  # Scores for this reader
			yf = func(y)
			rtn[lvl] = yf  # rtn.append((func(y),lvl))
		except:
			pass
	return(rtn)


def recify(rtn):  # Flatten results
	rtna = np.vstack(rtn).flatten()
	rtna = rtna.view(np.recarray)
	return(rtna)


def mkdict(name, zar):  # Create a dictionary with references to our array
	rtn = {}
	for i in zar:
		try:
			rtn[i[name]] = i
		except:
			pass
	return(rtn)

# import sys; sys.argv="./analyzeD.py tutorial-2012-08-07-DryRun.db x 1 3 /home/fws/source/ROC.py".split(); sys.argv[2]='2012/08/07 Tutorial'
# import sys; sys.argv="./analyzeD.py tutorial-2012-08-07-DryRun.db x 1 3 /home/sam/source/ROC.py".split(); sys.argv[2]='2012/08/07 Tutorial'
# See tmp.py


# if __name__ == "__main__":
if True:
	# get script arguments
	(databasename, configname, session, partno, rocscript) = sys.argv[1:6]
	execfile(rocscript)  # Read my ROC.py file.

	# Set up some directories for the output.
	dirname = os.path.dirname(databasename)
	cfgname = configname.replace("/", "-").replace(" ", "-")
	if dirname:
		dirname += '/'+cfgname
	else:
		dirname = cfgname
	try:
		os.mkdir(dirname)
	except:
		pass

	session = int(session)
	partno = int(partno)
	tbltoanalyze = configname+"-Session "+str(session)+"-Answers"

	master = gettable(databasename, "sqlite_master")  # Read in the database.

	if not tbltoanalyze in master.tbl_name or not configname in master.tbl_name:
		print(tbltoanalyze, configname)
		print(master.tbl_name)
		print('Ending')
		raise Exception()  # Error

	# Names of the sections
	try:
		partnames = gettable(databasename, configname)
		partname = partnames.partName[partnames.partNumber == partno][0]
	except:
		partname = ""

	# How many points does each kind of answer get for this section?
	pointstable = gettable(databasename, configname+"Points")

	partstbl = gettable(databasename, configname)

	responses = gettable(databasename, tbltoanalyze)

	# Add  truth and score columns
#	responses=mlab.rec_append_fields(responses,["truth","score",'case'],
	responses = rec.append_fields(responses, ["truth", "score", 'case'],
								  (sigim3(responses), score(responses.answer),
								  casename(responses.prompt)), asrecarray=True)
	pgroups = gettable(databasename, configname+"Part"+str(partno)+"Groups")

	if False:
		# This code finds the images that were difficult...?
		party = responses[np.logical_or(responses.partNumber == 2,
										responses.partNumber == 3)]
		party.truthi = (party.truth == '+')
		imscrs = dd(float)
		for i in party:
			if np.isfinite(i.score):
				imscr[i.case] += 1-logical_xor(i.score, i.truthi)
		ikeys = imscr.keys()
		ikeys.sort()
		for i in ikeys:
			print(i, imscr[i])

	if True:
		party = responses[responses.partNumber == partno]

		def binscores(x):
			return((x > 50).astype(np.float))

		def sensfps(x):  # Calculate sensitivity and spec
			sigsc = rmna(x[x.truth == "+"].score)
			abssc = rmna(x[x.truth == "-"].score)
			if not len(sigsc) or not len(abssc):
				return(None)
			tnN = np.sum(abssc < 50)
			tpN = np.sum(sigsc > 50)
			fpf = np.mean(abssc > 50)
			tpf = np.mean(sigsc > 50)
			tnNSD = np.sqrt(fpf*(1.-fpf)*len(abssc))
			fpfSD = tnNSD*len(abssc)
			tpNSD = np.sqrt(tpf*(1.-tpf)*len(sigsc))
			tpfSD = tpNSD*len(sigsc)
			if np.isnan(fpf) or np.isnan(tpf):
				return(None)
			lmda = np.log(fpf)/np.log(tpf)
			scr = tpN * pointstable[partno-1][1]+tnN * pointstable[partno-1][2]
			result = (fpf, tpf, lmda, lmda/(lmda+1.), tnN, tpN, scr, -scr,
					  x[0].groupNumber, x[0].username, (
						  tpf+1.-fpf)/2., (tpf+fpf)/2.,
					  np.sum(x.truth == "+"), np.sum(x.truth == '-'),
					  fpfSD, tnNSD, tpfSD, tpNSD)
			rtn = np.array([result], dtype=[
				('fpf', np.float), ('tpf', np.float),
				('Powerindex', np.float), ("AUC", np.float),
				("TN", np.int), ("TP", np.int), ("score", np.float),
				('negscore', np.float), ("group", np.int),
				('username', x.username.dtype), ('Youden', np.float),
				('Anti-Youden', np.float), ('Napos', np.float),
				('Naneg', np.float),
				('fpf-SD', np.float), ('TN-SD', np.float), ('tpf-SD', np.float),
				('TP-SD', np.float)
			])
			rtn = rtn.view(np.recarray)
			return(rtn)

		# The variable z contains sensitivities, specificities
		# Calculate Se,sp for each user
		z = recify(by("username", sensfps, party))
		z.sort(order='negscore')  # Sort in decreasing score order
		zdict = mkdict('username', z)

		def rddatafunc(x):
			x = x[np.argsort(x.case)]  # Sort by case names
			sigsc = rmna(x[x.truth == "+"].score)
			abssc = rmna(x[x.truth == "-"].score)
			return((abssc, sigsc))

		def rocc(x):  # Calculate roc curve
			sigsc = rmna(x[x.truth == "+"].score)
			abssc = rmna(x[x.truth == "-"].score)
			if not len(sigsc) or not len(abssc):
				return(None)
			a, vara = simpleAUCvar(sigsc, abssc)
			try:
				xxax, uvara = unbiasedAUCvar(sigsc, abssc)
			except:
				pass
			snr = (np.mean(sigsc)-np.mean(abssc)) / \
				np.sqrt(np.var(sigsc)+np.var(abssc))
			psnr = stats.norm.cdf(snr)

			# the random fizz added to -a below is to prevent ties...
			return(np.array([(rocxy(sigsc, abssc), a,
							  -a+np.random.random()*1e-6, a/(1.-a),
							  x[0].groupNumber, x[0].username, snr, psnr,
							  np.sqrt(vara), np.sqrt(uvara))],
							dtype=[('roc', np.object), ('auc', np.float),
								   ('negauc', np.float), ('Powerindex', np.float),
								   ("group", np.int), ('username', x.username.dtype),
								   ('SNR', np.float), ('pSNR',
													   np.float), ('auc-SD', np.float),
								   ('auc-uSD', np.float)]))

		# The variable zroc contains all the ROC information.
		# Calculate ROC for each user
		zroc = recify(by("username", rocc, party))
		zroc.sort(order='negauc')
		zrocdict = mkdict("username", zroc)
		# Make structure of all scores
		rddata = bydict("username", rddatafunc, party)
		try:
			n0max = np.max([len(i[0]) for i in rddata.values()])
			n1max = np.max([len(i[1]) for i in rddata.values()])
			# Dump the readers who do not have scores for all images.
			rddataGood = dict([(i, rddata[i]) for i in rddata
							   if len(rddata[i][0]) == n0max and len(rddata[i][1]) == n1max])
			rddata2 = [i for i in rddataGood.values()]
			# print(rddata2)
			# Data clean up
			mrmcresults = MRMCvariance(rddata2)

			# Do binary MRMC.
			# Acutal positives
			possuccess = np.array([binscores(i[1]) for i in rddata2])
			sensMRMC = unbiasedMeanMatrixVar(possuccess)
			negsuccess = np.array([binscores(i[0]) for i in rddata2])
			specMRMC = unbiasedMeanMatrixVar(possuccess)
		except:
			pass

		try:
			scordict = dd(dict)  # A dictionary of dictionaries
			casetruthdict = dd(dict)
			for i in party:
				scordict[i.username][i.case] = i.score
				casetruthdict[i.case] = (i.truth == '+')
		except:
			pass

		def scoresnstuff(x):
			casesp = np.unique(x.case[x.truth == '+'])
			casesn = np.unique(x.case[x.truth == '-'])
			cases = np.concatenate((casesp, casesn))
			readers = np.unique(party.username)

			scorz = {}
			# print(scordict)
			def inloop(z): return ((np.array([z[j] for j in casesn]),
									np.array([z[j] for j in casesp])))
			for i in scordict:
				scorz[i] = inloop(scordict[i])
#			np.array([ inloop(scordict[i]) for i in scordict])
			return(scorz)
		try:
			# CRAP this does not work for for the word part.
			# Get this fixed.
			scorzdict = scoresnstuff(party)
			scorz = [scorzdict[i] for i in scorzdict]
		except:
			pass

	if True:
		def stp(lbl="TPF"):
			fig = pp.figure(1, figsize=(4.6, 4.6))
			ax = fig.add_axes((.12, .12, .78, .78))
#			pp.axis([-.005,1.005,-.005,1.005])
			ax2 = ax.twiny()
			ax2.axis([1.005, -.005, -.005, 1.005])
			ax.axis([-.005, 1.005, -.005, 1.005])

			if lbl == "TPF":
				# Axis labels for the ROC curves
				ax.set_xlabel('False Positive Fraction')
				ax.set_ylabel('Sensitivity / True Positive Fraction')
				ax2.set_xlabel('Specificity / True Negative Fraction')
			else:
				# Axis labels for the memory curves.
				ax.set_xlabel('Incorrect Blue Fraction')
				ax.set_ylabel('Correct Red Fraction')
				ax2.set_xlabel('Correct Blue Fraction')
			return((fig, ax))

		def endp(fig, filename):   # Close figure
			fig.set_size_inches(4.6, 4.6)
			fig.savefig(filename, dpi=200)
			fig.clf()

		def plotmeanlambda(lmdas, col='k'):
			lmdas2 = lmdas[np.logical_and(lmdas > 1, lmdas < 1.e4)]
			mlmda = np.exp(np.mean(np.log(lmdas2)))  # mean lambda
			xx = np.arange(0, 1, .01)
			ax.plot(xx, xx**(1./mlmda), '-', lw=15, color=col, alpha=.3)

		def plotlambdalimits(lmdas):
			lmdas = np.sort(lmdas)
			l1 = len(lmdas)
			i1 = int(l1/6.)
			i2 = int(l1*5./6.)+1
			if i2 >= l1:
				i2 = l1-1
			xx = np.arange(0, 1, .01)
			for ii in lmdas[i1], lmdas[i2]:  # power law curve
				ax.plot(xx, xx**(1./ii), '-', lw=10, color='k', alpha=.3)
				# ax.plot(xx, xx**(1./3.8),'-',lw=20,color='k',alpha=.3)

		def addmeanpowerlaw(lambdas=None, ROC=False):
			if not lambdas:
				if ROC:
					areas = np.array([i[0][1] for i in zroc])
					lambdas = areas/(1.-areas)
				else:
					lambdas = np.array([i[0][2] for i in z])
			plotmeanlambda(lambdas)

		def addROC(ax, toplot=None):
			if not toplot:
				toplot = zroc
			for i in toplot:
				ax.plot(i['roc']['x'], i['roc']['y'], '-')
			ax.plot(np.array((0, 1)), np.array((0, 1)), ':')

		grps = ["bo", 'r*', 'gv', 'ms']
		colors = ('b', 'r', 'g', 'm', 'c', 'y', 'k')

		def textify(ax, x):
			ax.text(x['fpf']+0.01, x['tpf'], x['username'],
					verticalalignment='top')

		def addBinPoints(ax, toplot=None, groups=None):
			if not toplot:
				toplot = z
			legdict = {}
			for x in toplot:
				pch = grps[0]
				label = ''
				if groups:
					try:
						pch = grps[groups[x['username']] % len(grps)]
						label = "Group "+str(groups[x['username']])
					except:
						continue
				stor, = ax.plot(x['fpf'], x['tpf'], pch, label=label, ms=7)
				legdict[pch] = (stor, label)
				textify(ax, x)
			if groups:
				leglst = [legdict[i][0] for i in legdict]
				lablst = [legdict[i][1] for i in legdict]
				ax.legend(leglst, lablst, loc=4)

		def correlation_plot(filename='/tmp/test.png'):
			fig = pp.figure(1, figsize=(4.6, 4.6))
			ax = fig.add_axes((.12, .12, .85, .85))
			ax.axis([.4, 1.005, .4, 1.005])
			if True:
				# Axis labels for the ROC curves
				ax.set_xlabel('AUC')
				ax.set_ylabel(r"Youden's Index or Norm(SNR)")
				p1, = ax.plot(zroc['auc'], zroc['pSNR'], grps[0],
							  label=r"Norm(SNR)")
				if False:
					for ii in zroc:
						ax.text(ii['auc']+0.01, ii['pSNR'],
								ii['username'], verticalalignment='top')
				youd = [zdict[i]['Youden'] for i in zroc['username']]
				p2, = ax.plot(zroc['auc'], youd, grps[1],
							  label="Youden's Index")
				ax.plot((.4, 1.), (.4, 1.), 'y--')
				ax.legend([p1, p2], [r"Norm(SNR)", "Youden's Index"], loc=4)
			endp(fig, filename)  # End the plot

		def simpROCplot(filename='/tmp/test.png', toplot=None,
						lbl='TPF', groups=None):
			fig, ax = stp(lbl=lbl)  # with points and names.
			addROC(ax, toplot=toplot)
			addBinPoints(ax, toplot=toplot, groups=groups)
			endp(fig, filename)

		def simpbinplot(filename='/tmp/test.png', toplot=None, groups=None,
						lbl='TPF'):
			# Make a simple binary plot
			fig, ax = stp(lbl=lbl)    # with points and names.
			ax.plot([0, 1], [0, 1], 'y:')
			ax.text(0.5, 0.5, 'Guessing Line', color='y',
					rotation=45, rotation_mode='anchor')
			addBinPoints(ax, toplot=toplot, groups=groups)
			endp(fig, filename)

		def addYouden(ax, toplot=None):
			if not toplot:
				toplot = z
			for x in toplot:
				stor, = ax.plot([0, x['fpf'], 1], [0, x['tpf'], 1], '--y')

		def individROCs(fln, flns, lbl='TPF'):
			j = 0
			lof = []
			for i in zdict:
				try:
					fig, ax = stp(lbl=lbl)    # with points and names.
					addBinPoints(ax, toplot=[zdict[i], ])
					if i in zrocdict:
						addROC(ax, toplot=[zrocdict[i], ])
					try:   # Youden approximation
						if i in zdict:
							addYouden(ax, toplot=[zdict[i], ])
					except:
						pass

					filename = fln+"-ROC"+str(j)+".png"
					lof.append(flns+"-ROC"+str(j)+".png")
					endp(fig, filename)
					j = j+1
				except:
					pass
			return(lof)

		# Some HTML convenience functions
		htmlskip = '<br><br><br><br><br><br><br><br><br><br><br><br>\n'
		tblntryMT = '<TD> &nbsp;&nbsp;</TD>\n'

		def tblntryd(x, ln='center'):   # Integer table entry
			return '<TD align="'+ln+'"><font size=4>%d</font></TD>\n' % x

		def tblntrys(x, ln='center'):
			return '<TD align="'+ln+'"><font size=4>%s</font></TD>\n' % x

		def tblntryf(x, ln='center'):   # Floating point table entry
			return '<TD align="'+ln+'"><font size=4>%.3f</font></TD>\n' % x

		def tblntryfsdf(x, ln='center'):   # Floating point table entry
			return '<TD align="'+ln+'"><font size=4>%.3f (%.3f)</font></TD>\n' % x

		def tblntrydsdf(x, ln='center'):  # Integer table entry + float error
			return '<TD align="'+ln+'"><font size=4>%d (%.1f)</font></TD>\n' % x

		def bintbl():
			# Throw in the table of scores
			hdr = """<A name="binScoretable"></A>
				   <B><font size=6>Binary Table</font></B><br>
				   <table cellpadding=3 cellspacing=3>
				   <TR><TD><B><font size=5>  NAME  </font></B></TD>
				   <TD><B><font size=5> &nbsp;&nbsp; </font></B></TD>
				   <TD><B><font size=5>  No. of TP  </font></B></TD>
				   <TD><B><font size=5> &nbsp;&nbsp; </font></B></TD>
				   <TD><B><font size=5>  No. of TN  </font></B></TD>
				   <TD><B><font size=5> &nbsp;&nbsp; </font></B></TD>
				   <TD><B><font size=5>  Points  </font></B></TD></TR>"""

			for i in z:
				try:
					hdr += '<TR><TD align="left"><font size=4>%s</font></TD>'\
						% i['username']
					for j in ((i['TP'], i['TP-SD']), (i['TN'], i['TN-SD'])):
						# TP and TN with errors
						hdr += tblntryMT+tblntrydsdf(j)

					hdr += tblntryMT+tblntryd(i['score'])  # User's score

				except:
					pass
			hdr += "\n</table><br>\n"
			return(hdr)

		def auctbl():   # Make a table of AUCs.
			hdr = """<A name="AUCtable"></A>
				   <B><font size=6>AUC Table</font></B><br>
				   <table cellpadding=3 cellspacing=3>
				   <TR><TD><B><font size=5>  NAME  </font></B></TD>
				   <TD><B><font size=5> &nbsp;&nbsp; </font></B></TD>
				   <TD><B><font size=5>  AUC  </font></B></TD>
				   <TD><B><font size=5> &nbsp;&nbsp; </font></B></TD>
				   <TD><B><font size=5>  Y = Youden's Index =(Se+Sp)/2 </font></B></TD>
				   <TD><B><font size=5> &nbsp;&nbsp; </font></B></TD>
				   <TD><B><font size=5> Difference </font></B></TD>
				   <TD><B><font size=5> &nbsp;&nbsp; </font></B></TD>
				   <TD><B><font size=5> &Phi;(SNR) </font></B></TD>
				   </TR>"""

			aucavg = np.zeros(4)
			for i in zroc:
				hdr += '<TR>'+tblntrys(i['username'], 'left')+tblntryMT
#				hdr+=tblntryf(i['auc'])+tblntryMT
				hdr += tblntryfsdf((i['auc'], i['auc-uSD']))+tblntryMT
				if i['username'] in zdict:
					youd = zdict[i['username']]['Youden']
					hdr += tblntryf(youd)+tblntryMT + tblntryf(i['auc']-youd)
				else:
					youd = 0
					hdr += 2*tblntryMT
				gappr = stats.norm.cdf(i['SNR'])  # Gaussian approximation
				hdr += tblntryMT + tblntryf(gappr)
				aucavg += np.array((i['auc'], youd, i['auc']-youd, gappr))
				hdr += '</TR>'
			aucavg /= len(zroc)
			hdr += '<tr><td colspan=9><hr></td></tr>\n'  # Horizontal line
			hdr += '<tr><td align="left"><font size=5><B>Mean</B></font></td>\n'\
				+ tblntryMT
			try:
				try:
					hdr += tblntryfsdf((aucavg[0],
									   np.sqrt(mrmcresults[1])))+tblntryMT
				except:
					hdr += tblntryfsdf((aucavg[0],
									   np.sqrt(mrmcresults[1])))+tblntryMT
			except:
				pass

			for i in 1, 3:
				hdr += tblntryf(aucavg[i])+tblntryMT
			hdr += "</tr>\n</table><br>\n"
			return(hdr)

		def htmlIMG(img):  # create HTML code for one image
			htmlc = '<A name="'+img+'"></A>\n'  # Anchor for image
			htmlc += '<img height="92%" src="'+img+'"><br>'
			return(htmlc)

		ankmatch = re.compile(' *<A name="(.*)"></A>.*')

		def makehtml(fln, hcodes):
			# This routine takes a number of sections of html code, each
			# beginning with an anchor (<A name...>), and combines them
			# into a single html file, where each html section has links
			# to the next and previous sections.
			htmlc = htmlhdr()

			ankors = [ankmatch.match(hci[0:120]).group(1) for hci in hcodes]
			for i in range(len(hcodes)):
				htmlc += hcodes[i]+'<br>'
				# Put in the anchors for the previous next items.
				if i:
					htmlc += '<a href="#'+ankors[i-1]+'">Previous</a> &nbsp; '
				else:
					htmlc += 'Previous &nbsp; '
				if i < len(hcodes)-1:
					htmlc += '<a href="#'+ankors[i+1]+'">Next</a><br>'
				else:
					htmlc += 'Next<br>'

				htmlc += 4*htmlskip
			htmlfinalize(fln, htmlc)   # The end

		def htmlhdr():
			hdr = '<html>\n<head><title>Results Part %d: %s</title><meta charset="UTF-8"></head>\n' % \
				(partno, partname)
			hdr += "<body> \n"
			return(hdr)

		def htmlfinalize(fln, hdr):
			hdr += htmlskip + '\n</body>\n</html>\n'

			htmlfile = fln+".html"
			fp = open(htmlfile, 'w')
			fp.write(hdr.encode('utf8'))
			fp.close()
			print(htmlfile)  # name of the html file for user interface.

		def dumpcsvdata(filename='tmp'):
			# First we have to figure out what we are dumping.
			# Which readers have usable data?
			lusers = np.unique(party.username)
			lcases = casetruthdict.keys()
			uncase = {}
			for u in lusers:
				try:  # Count how many successful cases each reader has
					uncase[u] = sum(np.isfinite(np.array([scordict[u][i]
														  for i in lcases])))
				except:
					pass
			ncaser = np.array(uncase.values())
			tohave = np.max(ncaser)  # readers have to have these cases
			nreaders = sum(tohave == ncaser)

			npos = np.sum(casetruthdict.values())
			nneg = len(lcases)-npos

			# First write in the Gallas, et al. format
#			if True:
			try:
				fp = open(filename+".imrmc", 'w')
				fp.write('Data from part '+str(partno)+' reader study class on ' +
						 str(datetime.datetime.now())+'\n')
				fp.write('N0: %d\n' % nneg)
				fp.write('N1: %d\n' % npos)
				fp.write('NR: %d\n' % nreaders)
				fp.write('NM: 1\nBEGIN DATA:\n')
				li = 0
				for i in lcases:
					fp.write("-1,%d,0,%d\n" % (li, casetruthdict[i]))

				ui = 0
				m = 1
				for u in lusers:
					li = 0
					if uncase[u] == tohave:
						ui += 1
						for i in lcases:
							li += 1
							fp.write("%d,%d,%d,%f\n" %
									 (ui, li, m, scordict[u][i]))
				fp.close()
			except:
				pass
			# Then write the DBM file format....
#			if True:
			try:
				fp = open(filename+".txt", 'w')
				fp.write('Data from part '+str(partno)+' reader study class on ' +
						 str(datetime.datetime.now())+'\n')
				top = True
				for u in lusers:
					if uncase[u] != tohave:
						continue
					fp.write(u+'\n')
					if top:
						top = False
						fp.write("Mode1\nLarge\n")
					for truei in False, True:
						for i in lcases:
							if casetruthdict[i] == truei:
								fp.write("%f\n" % (scordict[u][i]))
						fp.write("*\n")

				fp.close()
			except:
				pass

		flns = cfgname+"-"+str(session)+"-"+str(partno)+"-"
		fln = dirname+"/"+flns

		# Below is the code that is run uniquely for each part of the
		# presentation.

		try:
			dumpcsvdata(
				filename='/var/www/html/Class/ClassResults/ReaderStudyData-Part%d' % partno)
		except:
			print("Could not dump csv data")

		if partno == 1:
			pass    # Ha! forget it! we make nothing for you.

		if partno == 2 and partstbl.interfaceType[partno-1] == 'Binary':
			try:
				# The first binary test
				tablebin = bintbl()
			except:
				pass
			try:
				# Make a plot and the associated html code
				simpbinplot(filename=fln+"f1.png")
				fig1html = htmlIMG(flns+"f1.png")
			except:
				pass

			try:
				# Mark points by groups in the first part.
				group1st = {}
				for i in responses[responses.partNumber == partno-1]:
					group1st[i.username] = i.groupNumber
				simpbinplot(filename=fln+"f2.png", groups=group1st)
				fig2html = htmlIMG(flns+"f2.png")
			except:
				pass

			   # Generate an additional table
			htmlc = """<A name="groupTable"></A>
	<B><font size=6>Training groups in part 1</font></B><br>
	<table cellpadding=3 cellspacing=3> <TR>
	<TD align="center"><B><font size=5> Group </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>
	<TD align="center"><B><font size=5>  Percent of class  </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD> 
	<TD align="center"><B><font size=5>  Prevalence  </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD> 
	<TD align="center"><B><font size=5>  Facial responses  </font></B></TD>
	</TR>\n<TR>"""
			try:

				p1groups = gettable(databasename, configname+"Part1Groups")

				for i in p1groups:
					htmlc += '<TR>'
					try:
						htmlc += tblntryd(i['groupNumber'])+tblntryMT
						for fld in ('classInGroup', 'targetPresent'):
							htmlc += tblntrys(str(i[fld])+"%")
							htmlc += tblntryMT
						if i['signalHandling'] == "Threefourths":
							htmlc += tblntrys("Actual positives")
						else:
							htmlc += tblntrys("Actual negatives")
					except:
						pass
					htmlc += '</TR>\n'
			except:
				pass
			htmlc += '</table>\n'

			# Calculate the average TPF, FPF, Youden's index.
			# Use medians
			tbl2 = """<A name="groupAvgPerf"></A>
	<B><font size=6>Average Performance for Each Group</font></B><br>
	<table cellpadding=3 cellspacing=3> <TR>
	<TD align="center"><B><font size=5>  Group  </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD> 
	<TD align="center"><B><font size=5>  Median Sensitivity  </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD> 
	<TD align="center"><B><font size=5>  Median Specificity  </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD> 
	<TD align="center"><B><font size=5>  Median Y=(Sens+Spec)/2 </font></B></TD>
	</TR>\n<TR> """
			# Use averages
			tbl2 = """<A name="groupAvgPerf"></A>
	<B><font size=6>Average Performance for Each Group</font></B><br>
	<table cellpadding=3 cellspacing=3> <TR>
	<TD align="center"><B><font size=5>  Group  </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD> 
	<TD align="center"><B><font size=5>  Mean Sensitivity  </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD> 
	<TD align="center"><B><font size=5>  Mean Specificity  </font></B></TD>
	<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD> 
	<TD align="center"><B><font size=5>  Mean Y=(Sens+Spec)/2 </font></B></TD>
	</TR>\n<TR> """

			try:
				grp1results = []
				grp2results = []
				for i in group1st:
					if not i in zdict:
						continue
					rdp = zdict[i]
					tfa = np.array([rdp['tpf'], 1-rdp['fpf'],
									rdp['Youden']])
					if group1st[i] == 1:
						grp1results.append(tfa)
					else:
						grp2results.append(tfa)
				grp1results = np.array(grp1results)
				grp2results = np.array(grp2results)

				g1tfa = np.median(grp1results, axis=0)
				g2tfa = np.median(grp2results, axis=0)
				# Generate HTML code.
				tbl2 += tblntryd(2)+tblntryMT
				for i in g2tfa:
					tbl2 += tblntryf(i)+tblntryMT
				tbl2 += '\n</TR><TR>\n'
				tbl2 += tblntryd(1)+tblntryMT
				for i in g1tfa:
					tbl2 += tblntryf(i)+tblntryMT
				tbl2 += '\n</TR><tr><td colspan=7><hr></td></tr>\n<TR>\n'
				tbl2 += tblntrys("Difference")+tblntryMT
				for i in (g2tfa-g1tfa):
					tbl2 += tblntryf(i)+tblntryMT
				tbl2 += '\n</TR>'
			except:
				pass
			tbl2 += '</table><br>\n'
			# try:
			makehtml(fln, (tablebin, fig1html, htmlc, fig2html, tbl2))
			# except:
			#	sys.stderr.write('failed to make html file');

		if partno > 2 and partstbl.interfaceType[partno-1] == 'Binary':
			lof = []
			try:
				simpbinplot(filename=fln+"f1.png")
				lof.append(htmlIMG(flns+"f1.png"))
			except:
				pass

			try:
				# Compare with previous experiment
				party2 = responses[responses.partNumber == partno-1]
				# Recalculate part 2
				z2 = recify(by("username", sensfps, party2))
				z2dict = mkdict('username', z2)

				# Loop over all observers, only 3 per plot
				nuserperim = 30
				imct = 0
				j = 0
				ssAdel = np.array((0, 0., 0.))  # Change in sens,spec, "auc"
				for u in zdict:
					try:
						if u in z2dict:
							if not imct:   # Create new plot.
								filename = fln+"-R"+str(j)+".png"
								lof.append(htmlIMG(flns+"-R"+str(j)+".png"))
								fig, ax = stp()
							xs = np.array((zdict[u]['fpf'], z2dict[u]['fpf']))
							ys = np.array((zdict[u]['tpf'], z2dict[u]['tpf']))
							ssAdel += np.array((-np.diff(xs)[0], np.diff(ys)[0],
												(np.diff(ys)[0] - np.diff(xs)[0])/2.))
							#	ax.plot( xs,ys, grps[imct%len(grps)])
							#	ax.plot(xs,ys,'-', color=colors[imct%len(colors)])
							ax.arrow(xs[1], ys[1], xs[0]-xs[1], ys[0]-ys[1],
									 width=.01,
									 head_width=.03, length_includes_head=True,
									 color=colors[imct % len(colors)])
							textify(ax, z2dict[u])
							# ax.plot((0,xs[1]),(0,ys[1]),':',
							# color=colors[imct%len(colors)])
							j += 1
							imct += 1
							if imct == nuserperim:
								endp(fig, filename)
								imct = 0
					except:
						pass
				if imct:
					endp(fig, filename)  # Close image file.
				ssAdel /= j   # Take the average...
				# Generate the web page.
				lof.append(bintbl())
			except:
				pass

			# Add a table showing average change in sens, spec, auc
			htmlc = """<A name="ChangeTable"></A>
<B><font size=6>Change in Se, Sp, and Sum Measures</font></B><br>
<table cellpadding=3 cellspacing=3> <TR>
<TD align="center"><B><font size=5>  Sensitivity  </font></B></TD>
<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>		
<TD align="center"><B><font size=5>  Specificity  </font></B></TD>
<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>		
<TD align="center"><B><font size=5>  Y=(Sens+Spec)/2 </font></B></TD>
</TR>\n <TR>
"""
			for i in ssAdel:
				htmlc += tblntryf(i)+tblntryMT
			htmlc += '</TR></table><br>'  # +4*htmlskip
			lof.append(htmlc)

			makehtml(fln, lof)

		if partstbl.interfaceType[partno-1] == 'Continuous':

			lof = []
			if True:  # Not for Dave's presentation.
				try:
					simpbinplot(filename=fln+"f0.png")
					lof.append(htmlIMG(flns+"f0.png"))
				except:
					pass

			try:
				simpROCplot(filename=fln+"f1.png")
				lof.append(htmlIMG(flns+"f1.png"))
				# lof=[flns+"f1.png",]
			except:
				pass

			# OK now make an ROC plot for each reader
			try:
				lof.extend([htmlIMG(i) for i in individROCs(fln, flns)])
			except:
				pass

			# Add a table of AUCs and binary scores
			try:
				lof.append(auctbl())
			except:
				pass

			try:
				correlation_plot(filename=fln+"corr1.png")
				lof.append(htmlIMG(flns+"corr1.png"))
			except:
				pass

			lof.append(bintbl())

			# Make a table comparing SD of se,sp,auc
			htmlc = """<A name="VariabilityTable"></A>
<B><font size=6>Variability Across Experiments</font></B><br>
<table cellpadding=3 cellspacing=3> <TR>
<TD align="center"><B><font size=5>  NAME  </font></B></TD>
<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>
<TD align="center"><B><font size=5> Mean Sens </font></B></TD>
<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>
<TD align="center"><B><font size=5> Std Dev Sens  </font></B></TD>
<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>
<TD align="center"><B><font size=5> Mean Spec  </font></B></TD>
<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>
<TD align="center"><B><font size=5> Std Dev Spec  </font></B></TD>
<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>
<TD align="center"><B><font size=5> Mean Y=(Se+Sp)/2  </font></B></TD>
<TD align="center"><B><font size=5> &nbsp;&nbsp; </font></B></TD>
<TD align="center"><B><font size=5> Std Dev Y  </font></B></TD>
</TR>"""
			try:
				# Look at variability in Se, sp, AUC across 3 experiments by reader?
				allz = {}
				allzroc = {}
				acctype = [('name', 'S200'), ('seMean', np.float),
						   ('seSTD', np.float), ('spMean',
												 np.float), ('spSTD', np.float),
						   ('aucMean', np.float), ('aucSTD', np.float)]
				tfauc = np.array([], dtype=acctype)
				partses = (2, 3, 4)
				for parti in partses:
					try:
						party = responses[responses.partNumber == parti]
						zner = recify(by("username", sensfps, party))
						allz[parti] = mkdict('username', zner)
						zner = recify(by("username", rocc, party))
						allzroc[parti] = mkdict("username", zner)
					except:
						pass
				rdrs = allz[4].keys()
				for rd in rdrs:
					try:
						if rd in allz[2] and rd in allz[3] and rd in allz[4]:
							tpfs = np.array([allz[i][rd]['tpf']
											for i in partses])
							fpfs = 1-np.array([allz[i][rd]['fpf']
											  for i in partses])
							aucish = (tpfs+fpfs)/2.

							rdperf = (rd, np.mean(tpfs), np.std(tpfs), np.mean(fpfs),
									  np.std(fpfs), np.mean(aucish), np.std(aucish))

							htmlc += '<TR>'+tblntrys(rd, 'left')
							for i in rdperf[1:7]:
								htmlc += tblntryMT + tblntryf(i)
							htmlc += '</TR>\n'   # End of line
							tfauc = np.append(
								tfauc, np.array(rdperf, dtype=acctype))
					except:
						pass

				tfauc = tfauc.view(np.recarray)

				htmlc += '<tr><td colspan=13><hr></td></tr>\n'
				htmlc += '<tr><td align="left"><font size=5><B>Mean</B></font></td>\n'
				for i in range(1, 7):
					htmlc += tblntryMT+tblntryf(np.mean(tfauc.field(i)))
				htmlc += '\n</tr>\n<tr><td align="left"><font size=5><B>Mean /Std.Dev</B></font></td>\n'
				for i in (1, 3, 5):
					for j in 1, 2, 3:
						htmlc += tblntryMT
					htmlc += tblntryf(np.mean(tfauc.field(i)) /
									  np.mean(tfauc.field(i+1)))
				htmlc += '</tr>'
			except:
				pass
			htmlc += '</table><br>'
			lof.append(htmlc)
			makehtml(fln, lof)

		if partstbl.interfaceType[partno-1] == 'Word':
			group = {}
			for i in zdict:
				try:
					group[i] = zdict[i]['group']
				except:
					pass
			try:
				simpbinplot(filename=fln+"f2.png", lbl='word', groups=group)
			except:
				pass
			try:
				simpROCplot(filename=fln+"f1.png", lbl='word', groups=group)
			except:
				pass
			lof = [htmlIMG(flns+"f2.png"), htmlIMG(flns+"f1.png"), ]
			try:
				lof.extend([htmlIMG(i)
						   for i in individROCs(fln, flns, lbl='word')])
			except:
				pass
			try:
				lof.extend((auctbl(), bintbl()))
			except:
				pass

			makehtml(fln, lof)


# 33 words for memorizing in 1 minute appears to be about right.
