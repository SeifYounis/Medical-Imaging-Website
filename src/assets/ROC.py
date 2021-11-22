#!/usr/bin/env python
# -*- coding: utf-8 -*-
import numpy
import scipy.stats as stats
numpy.c=numpy.concatenate

def snrEst(x0,x1):
	return ((numpy.mean(x1)-numpy.mean(x0))/
	        numpy.sqrt(numpy.var(x0)+numpy.var(x1)))

def table(x,levels=None):   # Like the R table function
	if not levels: levels=set(x)  
	tbl={}
	for i in levels: tbl[i]=0
	for i in x: tbl[i]+=1
	return(tbl)   # Returns a table that is a dictionary.

def numtable(x,levels=None):
	# Create a numerical table that is a numpy array.
	tbl=numpy.array(list(table(x,levels).items()),
			dtype=[('value','f4'),('number','i4')])
	tbl.sort(order='value')  # put the table in order by value
	return(tbl)

def rocxy(apos,aneg):  # Data points for an empirical ROC curve.
	def cmsm(x,lvls):
		return 1.-numpy.append(0,numpy.cumsum(
			  numtable(x,levels=lvls)['number']))/float(len(x))
	lvls= set(apos) | set(aneg)
	return { 'x':cmsm(aneg,lvls),'y':cmsm(apos,lvls) }

#   return numpy.append(0,cumsum(table(x,levels=lvls)[::-1,1]))\

def auc(apos,aneg):  # Calculate AUC
	# The Below returns AUC with .5 as a limit.  Not what we want.
	#	return(stats.mannwhitneyu(apos,aneg)[0]/len(apos)/len(aneg))  
	n=len(aneg)
	return(1.-(numpy.sum(stats.rankdata(numpy.c((aneg,apos)))[0:n])-
	       n*(n+1)/2.)/n/len(apos))

def aucsmooth(apos,aneg,smooth=0.2):  # A kernel smoothed AUC
	p=apos[:,None] # turn into 2D array, transpose.
	sm=smooth* numpy.sqrt(numpy.var(apos)+numpy.var(aneg))
	return(numpy.mean(stats.norm.cdf(p-aneg,scale=sm)))

def simpleAUCvar(apos,aneg):
	a=auc(apos,aneg)
	neff= 2/(1./len(apos)+1./len(aneg))
	return(numpy.array((a, a*(1.-a)/(2.*neff))))

def mindistfit(x,y):
	# I got this off Mathworld.  Least squares fit to a line
	wh=numpy.isfinite(x) & numpy.isfinite(y)
	x=x[wh]
	y=y[wh]
	n=len(x)
	xm=numpy.mean(x)
	ym=numpy.mean(y)
	A=((numpy.sum(y*y)-ym*ym*n) - (numpy.sum(x*x)-n*xm*xm)
         	)/ (n*xm*ym-numpy.sum(x*y))/2;
	a= -A+numpy.sqrt(A*A+1);
	b= numpy.mean(y)-a*numpy.mean(x);
	return(numpy.array((a,b)));  # return slope, intercept.

def powerVarEst(auc,n0,n1): 
	# The very good power-law variance estimate from Hanley/McNeil
	auc2=auc*auc
	q1=auc/(2.-auc)
	q2=2.*auc2/(1.+auc)
	return( (auc-auc2+(n1-1.)*(q1-auc2)+(n0-1.)*(q2-auc2))/n0/n1 )

def rmna(x):  # Remove the NAs and other bad stuff.
	return( x[numpy.isfinite(x)])


def powerIndxEst(x0,x1):
	# Estimate the power index of ROC data two ways.
	n1=len(x1)
	n0=len(x0)

	# First estimate, based on non-parametric AUC.  This estimate
	# is biased when data is categorical, b/c nonparametric AUC is
	# biased when data is categorical.
	auc1=auc(x1,x0)
	e1=auc1/(1-auc1)

	# Low bias parametric estimate
	allr=stats.rankdata(numpy.c((x0,x1)),method='max') # Ranks of 1 wrt 0
	rank0= stats.rankdata(x0,method='max')
	rank1= stats.rankdata(x1,method='max')
	fpr=1-numpy.c(( rank0, allr[n0:(n1+n0)]-rank1  ))/float(n0)
	tpr=1-numpy.c(( allr[0:n0]-rank0, rank1))/float(n1)
	lr=numpy.log(fpr)/numpy.log(tpr)  # Slope at each point.
	e2=numpy.exp(numpy.mean(rmna( numpy.log(lr)))) # Harmonic mean
	# If we have just two categories, we have just 1 fpr,tpr value.
	return( (e1,e2))


def resample(x, replace=True):   # A resampling routine
	n=len(x)
	if replace:
		return(x[numpy.random.random_integers(0,n-1,n)])
	else:
		return(numpy.random.permutation(x))

def bsvar(r1):  # Bootstrap variance estimate.
	return(numpy.var(numpy.array([ auc(resample(r1[1]),resample(r1[0])) 
	                            for i in range(1000)])))


def MRMCtest():   # Testing MRMCvariance()
	numpy.random.seed()  # use /dev/urandom
	nreader=10
	ncases=20
	nsim=2000
	xcor=.5  # Number between 0 and 1
	xc2=numpy.sqrt(1-xcor)**2
	def sim1():
		s0=numpy.random.normal(size=ncases)
		s1=numpy.random.normal(size=ncases)
		def set1():
			s00=xcor*s0 + xc2*numpy.random.normal(size=ncases)
			s11=xcor*s1 + xc2*numpy.random.normal(size=ncases)+1.5
			return((s00,s11))
		return([set1() for i in range(nreader)])
	ret=numpy.array([MRMCvariance(sim1()) for j in range(nsim)])
	numpy.save('/home/fws/tmp/vtest'+str(numpy.random.randint(9999999999)),
		   ret)
#	return(ret)

	
def MRMCvariance(m0):
	# DBM variance estimate; it works pretty wel.l
	# m0 is an iterable object, containing one object for each reader.
	# The reader object is a tuple, which is a pair of numpy arrays, 
	# one for negatives, one for positives, 

	#  #Calculate  AUC and variance of each reader
	aucs=numpy.array([unbiasedAUCvar(rmna(rdr[1]),rmna(rdr[0])) for rdr in m0]) 
	# Calculate array of psuedovalues
	def pseudo(rdr):	
		s0=rmna(rdr[0])
		s1=rmna(rdr[1])
		N=len(s0)+len(s1)
		aa=auc(s1,s0)
		def rm1(s,i): return(numpy.delete(s,i))
		pseudo1=numpy.array([auc(rm1(s1,i),s0) for i in range(len(s1))])
		pseudo0=numpy.array([auc(s1,rm1(s0,i)) for i in range(len(s0))])
		return((N*aa-numpy.c((pseudo0,pseudo1))*(N-1)))
	pseudos=numpy.array([pseudo(rdr) for rdr in m0])
	N0=len(m0[0][0])+len(m0[0][1])

	return((numpy.mean(rmna(aucs[:,0])),unbiasedMeanMatrixVar(pseudos)[1]))


def MRMCdiffVariance(m0,m1):
	# DBM variance estimate; it works pretty wel.l
	# m0 is an iterable object, containing one object for each reader.
	# The reader object is a tuple, which is a pair of numpy arrays, 
	# one for negatives, one for positives, 

	#  #Calculate  AUC and variance of each reader
	aucs=numpy.array([unbiasedAUCvar(rmna(m1[r][1]),rmna(m1[r][0]))-
					  unbiasedAUCvar(rmna(m0[r][1]),rmna(m0[r][0]))
					  for r in range(len(m0))])
	# Calculate array of psuedovalues
	def pseudo(rdr):
		s0=rmna(rdr[0])
		s1=rmna(rdr[1])
		N=len(s0)+len(s1)
		aa=auc(s1,s0)
		def rm1(s,i): return(numpy.delete(s,i))
		pseudo1=numpy.array([auc(rm1(s1,i),s0) for i in range(len(s1))])
		pseudo0=numpy.array([auc(s1,rm1(s0,i)) for i in range(len(s0))])
		return((N*aa-numpy.c((pseudo0,pseudo1))*(N-1)))
	pseudos=( numpy.array([pseudo(rdr) for rdr in m1]) -
			  numpy.array([pseudo(rdr) for rdr in m0]))
	
	return((numpy.mean(rmna(aucs[:,0])),unbiasedMeanMatrixVar(pseudos)[1]))


def unbiasedMeanMatrixVar(sm,df=1):
	# Estimate the unbiased variance of the mean of a 2D matrix with 
	# two way random effects + residuals
	n0,n1 = sm.shape
	auc=numpy.mean(sm)
	x0est=sm.mean(axis=0)
	x1est=sm.mean(axis=1)
	MST=numpy.var(sm,ddof=df)
	MSA=n1*numpy.var(x1est,ddof=df)
	MSB=n0*numpy.var(x0est,ddof=df)
	ev=( (n0*n1-1)*MST - (n0-1)*MSA-(n1-1)*MSB)/((n0-1)*(n1-1))
	sig1=(MSA-ev)/n1;   sig2=(MSB-ev)/n0
	vout=(MSA+MSB-ev)/n0/n1
#	if numpy.any(np.array((MST,MSA,MSB,ev))< -2e-15):
#	if vout<0.:
	if False:
		print(n0,n1,MST,MSA,MSB,ev,vout)
		n=n0
		m=n1
		M=(n-1.)*(m-1.)/(m*n-1.)
		if True:
#			mtx1=numpy.matrix([[1, m-1, -1, 1-m],[1,-1,n-1,1-n],
#			                  [1 , -M/(n-1), -M/(m-1), -M],[M, -M,-M,M]])
#			mtx1=numpy.matrix([[1, m-1, -1, 1-m],[1,-1,n-1,1-n],
#			                  [1 , -M/(n-1), -M/(m-1), -M],[1, -1,-1,1]])

			mtx1=numpy.matrix([[1, m-1, -1, 1-m],[1,-1,n-1,1-n],
			                  [1 , -M/(n-1), -M/(m-1), -M],[1, -1,-1,1]])
			print(mtx1)
			mtxi1=numpy.linalg.inv(mtx1)
#			ubvc=mtxi*numpy.transpose(numpy.matrix([MSA, MSB, MST,ev]))
			ubvc1=mtxi1*numpy.transpose(numpy.matrix([MSA, MSB, MST ]))
		# ubvc = p11, p12, p21, gam^2
#		print(ubvc[0:3]-ubvc[3]) # These should be positive...
		print(ubvc1) # These should be positive...
		

	return(numpy.array((auc, vout)))

def successmatrix(x1,x0):
	b=x1.copy()
	b.shape=(-1,1)
	dm=b-x0
#	return(stats.norm.cdf(dm))
#	return(numpy.abs((dm)))
#	return(np.sin(dm*3)+dm*3) # wacky monotonic function
#	xx=stats.norm.rvs(size=np.prod(dm.shape)); xx.shape=dm.shape
#	return(dm+ xx)
#	return(dm**2) 
#	return(np.floor(dm*2)) # Step
#	return(dm**2) # squared function

	return((numpy.sign(dm)+1.)/2)  # Success matrix -- actual kernel

def unbiasedAUCvar(x1, x0,df=1): # unbiased estimate of AUC variance.
	# Use this version.  It works
	sm=successmatrix(x1,x0)
	return(unbiasedMeanMatrixVar(sm,df))


def unbiasedAUCvarWrong(x1, x0):  # unbiased estimate of AUC variance.
	# This routine is close, but not the unbiased soln. Don't use.
	n1=(len(x1))
	n0=len(x0)
	n0n1=n0*n1
	b=x1.copy()
	b.shape=(-1,1)
	sm=(numpy.sign(b-x0)+1.)/2  # Success matrix
	auc=numpy.mean(sm)
	x0est=sm.mean(axis=0)
	x1est=sm.mean(axis=1)
	sa=numpy.var(sm)  * n0n1/ (n0n1-1.)
	xv0=numpy.var(x0est) *n0/(n0-1.)
	xv1=numpy.var(x1est) *n1/(n1-1.)
	ev=(sa-xv0-xv1)/(1-1./n1-1./n0)
	xv0=xv0-ev/n1
	xv1=xv1-ev/n0
	return(numpy.array((auc, xv0/n0+xv1/n1+ev/n0n1 )))

def unbiasedAUCvar1(x1, x0):  # unbiased estimate of AUC variance.
	# Don't use this.
	# This routine is very inefficient don't send it large arrays.
	n1=(len(x1))
	n0=len(x0)
	n0n1=n0*n1
	cst0=float(n0n1)/(n1-1.)/(n0-1.)
	b=x1.copy()
	b.shape=(-1,1)
	sm=(numpy.sign(b-x0)+1.)/2  # Success matrix
	vm=numpy.outer(sm,sm)   # Product of success matrix w/ itself.
	auc=numpy.sum(sm)/n0n1
	delc=numpy.empty_like(vm)   #This matrix will be delta weights
	delc[:,:]= 1- cst0
	for i in xrange(n1):
		j=i*n0
		delc[ j:(j+n0),j:(j+n0)]=1
	ind=numpy.arange(0, n0n1, n0)
	for i in xrange(n0n1):
		delc[i,ind]=1
		ind=(ind+1)%(n0n1)
	return((auc,numpy.sum(delc*vm)/n0n1/n0n1)) # unbiased est of variance
	

def testy():
	x0=stats.norm.rvs(size=30)
	x1=stats.norm.rvs(size=30)+2.2
#	x0=stats.norm.rvs(size=25)+1.2
#	x1=stats.expon.rvs(size=25)+1.3333
	return(unbiasedAUCvar(x1,x0))
#	return(auc(x1,x0))

def testz():
	mm=numpy.array(numpy.random.normal(size=20))
	mm.shape=(4,5)
	return(unbiasedMeanMatrixVar(mm))
#zz=numpy.array([ testy() for i in xrange(10000)])

if False:
	MRMCtest()
if False:
	import glob
	a=numpy.vstack([numpy.load(i) for i in glob.glob('vtest*.npy')])
	

